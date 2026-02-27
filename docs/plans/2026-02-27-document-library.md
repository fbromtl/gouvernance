# Document Library Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the "Guides et cadres de référence" section on `/ressources` with a public document library organized by jurisdiction, with auth-gated file access.

**Architecture:** Supabase table `public_documents` stores metadata (publicly readable via RLS). Files live in a private Supabase Storage bucket `public-documents`, accessible only via signed URLs after authentication. UI uses Tabs (jurisdiction) + Accordion (categories) + Cards (documents). A login Dialog pops up when unauthenticated users click "Consulter".

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Supabase (Postgres + Storage), @tanstack/react-query, Shadcn UI (Tabs, Accordion, Dialog, Card, Badge), Framer Motion, i18next, Lucide icons.

**Design doc:** `docs/plans/2026-02-27-document-library-design.md`

---

### Task 1: Create Supabase migration for `public_documents` table

**Files:**
- Create: `supabase/migrations/20260227000001_create_public_documents_table.sql`

**Step 1: Write the migration SQL**

```sql
-- Public document library: metadata visible to all, files behind auth
CREATE TABLE public.public_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('quebec', 'canada', 'europe', 'france', 'usa')),
  category_slug TEXT NOT NULL,
  category_name TEXT NOT NULL,
  category_description TEXT NOT NULL DEFAULT '',
  category_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'html')),
  storage_path TEXT NOT NULL,
  summary_purpose TEXT NOT NULL DEFAULT '',
  summary_content TEXT NOT NULL DEFAULT '',
  summary_governance TEXT NOT NULL DEFAULT '',
  document_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for the main query pattern: list by jurisdiction
CREATE INDEX idx_public_documents_jurisdiction ON public.public_documents(jurisdiction, category_order, document_order);

-- RLS: anyone can read published documents metadata
ALTER TABLE public.public_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published public documents"
  ON public.public_documents
  FOR SELECT
  USING (is_published = true);

-- Only service role can insert/update/delete (admin scripts)
CREATE POLICY "Service role full access"
  ON public.public_documents
  FOR ALL
  USING (auth.role() = 'service_role');
```

**Step 2: Apply migration locally**

Run: `npx supabase db push` (or apply via Supabase dashboard if remote-only)

**Step 3: Commit**

```bash
git add supabase/migrations/20260227000001_create_public_documents_table.sql
git commit -m "feat(docs): create public_documents table with RLS"
```

---

### Task 2: Add TypeScript types and data-fetching hook

**Files:**
- Create: `src/types/public-documents.ts`
- Create: `src/hooks/usePublicDocuments.ts`

**Step 1: Create the TypeScript types**

Create `src/types/public-documents.ts`:

```typescript
export type Jurisdiction = 'quebec' | 'canada' | 'europe' | 'france' | 'usa';

export interface PublicDocument {
  id: string;
  jurisdiction: Jurisdiction;
  category_slug: string;
  category_name: string;
  category_description: string;
  category_order: number;
  title: string;
  file_name: string;
  file_type: 'pdf' | 'html';
  storage_path: string;
  summary_purpose: string;
  summary_content: string;
  summary_governance: string;
  document_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategory {
  slug: string;
  name: string;
  description: string;
  order: number;
  documents: PublicDocument[];
}

export const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'quebec', label: 'Québec' },
  { value: 'canada', label: 'Canada' },
  { value: 'europe', label: 'Europe' },
  { value: 'france', label: 'France' },
  { value: 'usa', label: 'USA' },
];
```

**Step 2: Create the data-fetching hook**

Create `src/hooks/usePublicDocuments.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { PublicDocument, Jurisdiction, DocumentCategory } from "@/types/public-documents";

/** Fetch all published documents for a jurisdiction, grouped by category */
export function usePublicDocuments(jurisdiction: Jurisdiction) {
  return useQuery({
    queryKey: ["public-documents", jurisdiction],
    queryFn: async (): Promise<DocumentCategory[]> => {
      const { data, error } = await supabase
        .from("public_documents")
        .select("*")
        .eq("jurisdiction", jurisdiction)
        .eq("is_published", true)
        .order("category_order", { ascending: true })
        .order("document_order", { ascending: true });

      if (error) throw error;

      // Group documents by category
      const categoryMap = new Map<string, DocumentCategory>();
      for (const doc of (data as PublicDocument[])) {
        if (!categoryMap.has(doc.category_slug)) {
          categoryMap.set(doc.category_slug, {
            slug: doc.category_slug,
            name: doc.category_name,
            description: doc.category_description,
            order: doc.category_order,
            documents: [],
          });
        }
        categoryMap.get(doc.category_slug)!.documents.push(doc);
      }

      return Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — this data rarely changes
  });
}

/** Generate a signed URL for a document (requires auth) */
export function useDocumentUrl() {
  const { user } = useAuth();

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase.storage
      .from("public-documents")
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (error) {
      console.error("Failed to get signed URL:", error);
      return null;
    }

    return data.signedUrl;
  };

  return { getSignedUrl };
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add src/types/public-documents.ts src/hooks/usePublicDocuments.ts
git commit -m "feat(docs): add public document types and data-fetching hook"
```

---

### Task 3: Create login dialog component

**Files:**
- Create: `src/components/auth/LoginDialog.tsx`

**Step 1: Create the login dialog**

This is a reusable Dialog that wraps the login flow (Google OAuth + email/password). It takes an `open` + `onOpenChange` prop and optionally a callback for after login.

Reference the existing login pattern in `src/pages/auth/LoginPage.tsx` (Google OAuth button + email form). Simplify it into a compact dialog:

```typescript
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Lock, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginDialog({ open, onOpenChange, onSuccess }: LoginDialogProps) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const { t } = useTranslation("common");
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    await signInWithGoogle();
    // OAuth redirects — onSuccess will be called after redirect back
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setError(t("loginError", "Identifiants invalides"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-2">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <DialogTitle className="text-center">
            Connexion requise
          </DialogTitle>
          <DialogDescription className="text-center">
            Connectez-vous pour accéder aux documents de la bibliothèque.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-11 gap-2"
            onClick={handleGoogle}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Email form */}
          {!showEmail ? (
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => setShowEmail(true)}
            >
              <Mail className="h-4 w-4" />
              Se connecter par email
            </Button>
          ) : (
            <form onSubmit={handleEmail} className="space-y-3">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Mot de passe</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Pas encore de compte ?{" "}
            <a href="/rejoindre" className="text-purple-600 hover:underline">
              Rejoindre le Cercle
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors.

**Step 3: Commit**

```bash
git add src/components/auth/LoginDialog.tsx
git commit -m "feat(auth): add reusable login dialog component"
```

---

### Task 4: Build the DocumentLibrary UI component

**Files:**
- Create: `src/components/resources/DocumentLibrary.tsx`

**Step 1: Create the DocumentLibrary component**

This component renders the full library section: jurisdiction tabs, category accordions, document cards with "Consulter" button.

```typescript
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Globe, ChevronRight, FileDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicDocuments, useDocumentUrl } from "@/hooks/usePublicDocuments";
import { useAuth } from "@/lib/auth";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { JURISDICTIONS } from "@/types/public-documents";
import type { Jurisdiction, PublicDocument } from "@/types/public-documents";

export function DocumentLibrary() {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("quebec");
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<string | null>(null);
  const { user } = useAuth();
  const { data: categories, isLoading } = usePublicDocuments(jurisdiction);
  const { getSignedUrl } = useDocumentUrl();

  const handleConsult = useCallback(async (doc: PublicDocument) => {
    if (!user) {
      setPendingDoc(doc.storage_path);
      setLoginOpen(true);
      return;
    }
    const url = await getSignedUrl(doc.storage_path);
    if (url) window.open(url, "_blank");
  }, [user, getSignedUrl]);

  const handleLoginSuccess = useCallback(async () => {
    if (pendingDoc) {
      const url = await getSignedUrl(pendingDoc);
      if (url) window.open(url, "_blank");
      setPendingDoc(null);
    }
  }, [pendingDoc, getSignedUrl]);

  return (
    <>
      <section id="guides" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <Badge variant="outline" className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium border-purple-200 text-purple-700 bg-purple-50">
              Bibliothèque documentaire
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Cadres et références par juridiction
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lois, guides, déclarations et cadres de gouvernance de l'IA —
              organisés par pays et province. Accès aux documents réservé aux membres.
            </p>
          </motion.div>

          {/* Jurisdiction tabs */}
          <Tabs value={jurisdiction} onValueChange={(v) => setJurisdiction(v as Jurisdiction)} className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto rounded-full bg-neutral-100 border border-neutral-200 p-1.5">
              {JURISDICTIONS.map((j) => (
                <TabsTrigger
                  key={j.value}
                  value={j.value}
                  className="text-xs sm:text-sm py-2 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {j.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-8">
              {JURISDICTIONS.map((j) => (
                <TabsContent key={j.value} value={j.value}>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Accordion type="multiple" className="space-y-3">
                      {categories.map((cat) => (
                        <AccordionItem
                          key={cat.slug}
                          value={cat.slug}
                          className="border border-neutral-200 rounded-2xl px-5 overflow-hidden"
                        >
                          <AccordionTrigger className="hover:no-underline py-5">
                            <div className="flex items-center gap-3 text-left">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 shrink-0">
                                <FileText className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{cat.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                              </div>
                              <Badge variant="secondary" className="ml-auto mr-2 shrink-0">
                                {cat.documents.length} doc{cat.documents.length > 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-5">
                            <div className="space-y-3">
                              {cat.documents.map((doc) => (
                                <DocumentCard
                                  key={doc.id}
                                  doc={doc}
                                  onConsult={() => handleConsult(doc)}
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <Card className="rounded-2xl border-dashed">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Documents à venir</p>
                        <p className="text-sm mt-1">La bibliothèque pour cette juridiction est en cours de préparation.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </section>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Document Card (sub-component)                                      */
/* ------------------------------------------------------------------ */

function DocumentCard({ doc, onConsult }: { doc: PublicDocument; onConsult: () => void }) {
  return (
    <Card className="rounded-xl border-neutral-200 hover:border-purple-200 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                {doc.file_type.toUpperCase()}
              </Badge>
              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
            </div>
            {(doc.summary_purpose || doc.summary_content || doc.summary_governance) && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {doc.summary_purpose && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_purpose}</span>
                  </li>
                )}
                {doc.summary_content && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_content}</span>
                  </li>
                )}
                {doc.summary_governance && (
                  <li className="flex gap-1.5">
                    <span className="text-purple-400 shrink-0">•</span>
                    <span>{doc.summary_governance}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            onClick={onConsult}
          >
            <FileDown className="h-3.5 w-3.5" />
            Consulter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Zero errors.

**Step 3: Commit**

```bash
git add src/components/resources/DocumentLibrary.tsx
git commit -m "feat(resources): add DocumentLibrary component with tabs, accordions, and auth gate"
```

---

### Task 5: Replace the "Guides" section in RessourcesPage

**Files:**
- Modify: `src/pages/RessourcesPage.tsx`

**Step 1: Add import for DocumentLibrary**

At the top of `RessourcesPage.tsx`, add:

```typescript
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";
```

**Step 2: Replace the Guides section**

Find the section with id="guides" (the first content section after the hero). This includes:
- The `guides` data array (4 items with icons, titles, descriptions, badges)
- The section JSX with the grid of 4 guide cards
- Any related icon imports that are only used for the guides (Book, Shield, etc.)

Replace the entire guides section JSX (from the section opening tag through the closing tag) with:

```tsx
<DocumentLibrary />
```

Remove the `guides` data array and any unused imports (icons that were only used in the guides section).

**Step 3: Verify build and preview**

Run: `npm run build`
Expected: Zero errors.

Preview: Navigate to `/ressources` and verify:
- The DocumentLibrary renders with jurisdiction tabs
- The 3 other sections (Boîte à outils, Veille réglementaire, Études de cas) still appear below
- The tabs default to "Québec"
- Empty state shows "Documents à venir" (until we seed data)

**Step 4: Commit**

```bash
git add src/pages/RessourcesPage.tsx
git commit -m "feat(resources): replace Guides section with DocumentLibrary"
```

---

### Task 6: Create Supabase Storage bucket and seed data script

**Files:**
- Create: `scripts/seed-public-documents.ts`

**Step 1: Create the seed script**

This script:
1. Creates the `public-documents` bucket in Supabase Storage (if not exists)
2. Reads the RAG folder structure from local disk
3. Uploads files to Supabase Storage
4. Inserts metadata rows into `public_documents` table

The script uses the Supabase service role key (from env) for admin access.

```typescript
/**
 * Seed script for public document library.
 *
 * Usage:
 *   npx tsx scripts/seed-public-documents.ts
 *
 * Requires env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Reads documents from: C:\Users\fbrom\OneDrive\Desktop\Gouvernance\RAG\
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RAG_ROOT = "C:/Users/fbrom/OneDrive/Desktop/Gouvernance/RAG";
const BUCKET = "public-documents";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const JURISDICTION_MAP: Record<string, string> = {
  "Québec": "quebec",
  "Canada": "canada",
  "Europe": "europe",
  "France": "france",
  "USA": "usa",
};

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`Created bucket: ${BUCKET}`);
  } else {
    console.log(`Bucket exists: ${BUCKET}`);
  }
}

function getFileType(filename: string): "pdf" | "html" {
  return filename.endsWith(".html") ? "html" : "pdf";
}

function getMimeType(filename: string): string {
  if (filename.endsWith(".html")) return "text/html";
  return "application/pdf";
}

async function seedJurisdiction(folderName: string) {
  const jurisdiction = JURISDICTION_MAP[folderName];
  if (!jurisdiction) {
    console.log(`Skipping unknown folder: ${folderName}`);
    return;
  }

  const jurisdictionPath = path.join(RAG_ROOT, folderName);
  const entries = fs.readdirSync(jurisdictionPath, { withFileTypes: true });

  // Skip index file, process only directories
  const categoryDirs = entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (let catIdx = 0; catIdx < categoryDirs.length; catIdx++) {
    const catDir = categoryDirs[catIdx];
    const catPath = path.join(jurisdictionPath, catDir.name);
    const categorySlug = catDir.name.toLowerCase();
    const categoryName = catDir.name
      .replace(/^\d+-/, "")
      .replace(/-/g, " ");

    const files = fs.readdirSync(catPath)
      .filter((f) => f.endsWith(".pdf") || f.endsWith(".html"))
      .sort();

    console.log(`  ${catDir.name}: ${files.length} files`);

    for (let docIdx = 0; docIdx < files.length; docIdx++) {
      const fileName = files[docIdx];
      const filePath = path.join(catPath, fileName);
      const storagePath = `${jurisdiction}/${categorySlug}/${fileName}`;
      const fileType = getFileType(fileName);

      // Upload file to storage
      const fileBuffer = fs.readFileSync(filePath);
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: getMimeType(fileName),
          upsert: true,
        });

      if (uploadError) {
        console.error(`    FAIL upload ${fileName}: ${uploadError.message}`);
        continue;
      }

      // Derive a human-readable title from filename
      const title = fileName
        .replace(/^\d+-/, "")
        .replace(/\.(pdf|html)$/, "")
        .replace(/-/g, " ");

      // Insert metadata (summaries will be filled manually or via AI later)
      const { error: insertError } = await supabase
        .from("public_documents")
        .upsert({
          jurisdiction,
          category_slug: categorySlug,
          category_name: categoryName,
          category_description: "",
          category_order: catIdx,
          title,
          file_name: fileName,
          file_type: fileType,
          storage_path: storagePath,
          summary_purpose: "",
          summary_content: "",
          summary_governance: "",
          document_order: docIdx,
          is_published: true,
        }, {
          onConflict: "storage_path",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error(`    FAIL insert ${fileName}: ${insertError.message}`);
      } else {
        console.log(`    OK ${fileName}`);
      }
    }
  }
}

async function main() {
  console.log("=== Seeding public document library ===\n");
  await ensureBucket();

  const folders = fs.readdirSync(RAG_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  for (const folder of folders) {
    console.log(`\nProcessing: ${folder}`);
    await seedJurisdiction(folder);
  }

  console.log("\n=== Done ===");
}

main().catch(console.error);
```

**Step 2: Add a unique constraint for upsert**

The seed script uses `upsert` on `storage_path`. Add a migration:

Create `supabase/migrations/20260227000002_public_documents_unique_path.sql`:

```sql
ALTER TABLE public.public_documents
  ADD CONSTRAINT public_documents_storage_path_key UNIQUE (storage_path);
```

**Step 3: Run the seed script**

Run: `npx tsx scripts/seed-public-documents.ts`
Expected: All 40 Québec documents uploaded + inserted. Other jurisdictions processed too.

**Step 4: Commit**

```bash
git add scripts/seed-public-documents.ts supabase/migrations/20260227000002_public_documents_unique_path.sql
git commit -m "feat(docs): add seed script for public document library"
```

---

### Task 7: Generate document summaries with AI

**Files:**
- Create: `scripts/generate-document-summaries.ts`

**Step 1: Create the summary generation script**

This script reads each document from `public_documents` that has empty summaries, fetches the file from storage, and uses Claude (or OpenAI) to generate the 3 summary fields. This is run once after seeding.

```typescript
/**
 * Generate AI summaries for public documents.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... npx tsx scripts/generate-document-summaries.ts
 *
 * Generates 3 structured summaries per document:
 *   - summary_purpose: À quoi sert ce document
 *   - summary_content: De quoi il est composé
 *   - summary_governance: Comment il sert la gouvernance IA
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "public-documents";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const anthropic = new Anthropic();

async function generateSummaries() {
  // Get documents with empty summaries
  const { data: docs, error } = await supabase
    .from("public_documents")
    .select("*")
    .eq("summary_purpose", "")
    .order("jurisdiction")
    .order("category_order")
    .order("document_order");

  if (error) throw error;
  console.log(`Found ${docs.length} documents needing summaries\n`);

  for (const doc of docs) {
    console.log(`Processing: ${doc.jurisdiction}/${doc.file_name}`);

    // For HTML files or PDFs, generate summary from title + context
    const prompt = `Tu es un expert en gouvernance de l'IA. Pour le document suivant, génère 3 résumés courts (1-2 phrases chacun) en français:

Titre: ${doc.title}
Fichier: ${doc.file_name}
Juridiction: ${doc.jurisdiction}
Catégorie: ${doc.category_name}

Réponds en JSON strict:
{
  "summary_purpose": "À quoi sert ce document (1-2 phrases)",
  "summary_content": "De quoi il est composé / ses sections principales (1-2 phrases)",
  "summary_governance": "Comment il sert la gouvernance de l'IA dans le contexte de ${doc.jurisdiction === "quebec" ? "le Québec" : doc.jurisdiction === "canada" ? "le Canada" : doc.jurisdiction === "france" ? "la France" : doc.jurisdiction === "europe" ? "l'Union européenne" : "les États-Unis"} (1-2 phrases)"
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`  SKIP: no JSON in response`);
        continue;
      }

      const summaries = JSON.parse(jsonMatch[0]);

      const { error: updateError } = await supabase
        .from("public_documents")
        .update({
          summary_purpose: summaries.summary_purpose || "",
          summary_content: summaries.summary_content || "",
          summary_governance: summaries.summary_governance || "",
        })
        .eq("id", doc.id);

      if (updateError) {
        console.log(`  FAIL update: ${updateError.message}`);
      } else {
        console.log(`  OK`);
      }

      // Rate limit: 100ms between calls
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.log(`  FAIL AI: ${err}`);
    }
  }

  console.log("\n=== Done ===");
}

generateSummaries().catch(console.error);
```

**Step 2: Run the script**

Run: `ANTHROPIC_API_KEY=... npx tsx scripts/generate-document-summaries.ts`
Expected: Each document gets 3 summary fields populated.

**Step 3: Commit**

```bash
git add scripts/generate-document-summaries.ts
git commit -m "feat(docs): add AI summary generation script for public documents"
```

---

### Task 8: Visual verification and final push

**Step 1: Start dev server and navigate to /ressources**

Run: `npm run dev`
Navigate to: `http://localhost:5173/ressources`

**Step 2: Verify functionality**

Check the following:
- [ ] Jurisdiction tabs render (Québec selected by default)
- [ ] Category accordions appear with document counts
- [ ] Click accordion → documents expand with title + summaries
- [ ] Click "Consulter" when NOT logged in → login dialog opens
- [ ] Login via Google → dialog closes, document opens in new tab
- [ ] Click "Consulter" when logged in → document opens directly
- [ ] Switch tabs (Canada, Europe, etc.) → content updates
- [ ] Empty jurisdictions show "Documents à venir" placeholder
- [ ] The 3 other sections (Boîte à outils, Veille, Études de cas) still work
- [ ] Mobile responsive: tabs wrap, cards stack

**Step 3: Push**

```bash
git push
```
