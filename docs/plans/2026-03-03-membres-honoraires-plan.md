# Membres Honoraires — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dedicated "Membres Honoraires" page with an application form, and upgrade the honorary banner on the pricing page to link to it.

**Architecture:** New page `/membres-honoraires` with hero + value props + form (React Hook Form + Zod). Form submits to a Deno Edge Function that emails the admin. The TarifsPage banner becomes a mini-card with CTA. All text is i18n-powered via a new `honorary` namespace.

**Tech Stack:** React 19, TypeScript, React Hook Form 7 + Zod 4, Framer Motion 12, i18next, Supabase Edge Function (Deno), Tailwind CSS 4 + shadcn/ui

---

### Task 1: Create i18n translation files

**Files:**
- Create: `src/i18n/locales/fr/honorary.json`
- Create: `src/i18n/locales/en/honorary.json`
- Modify: `src/i18n/index.ts`

**Step 1: Create the FR translation file**

Create `src/i18n/locales/fr/honorary.json`:

```json
{
  "seo": {
    "title": "Devenez Membre Honoraire — Cercle de Gouvernance IA",
    "description": "Vous œuvrez dans l'IA ? Rejoignez le Cercle de Gouvernance en tant que Membre Honoraire et contribuez à façonner la gouvernance responsable de demain."
  },
  "hero": {
    "title": "Devenez Membre Honoraire",
    "subtitle": "Vous œuvrez dans l'IA ? Rejoignez le Cercle et contribuez à façonner la gouvernance responsable de demain."
  },
  "why": {
    "title": "Pourquoi devenir Membre Honoraire ?",
    "contribute": {
      "title": "Contribuez",
      "description": "Partagez votre expertise, vos idées et vos retours d'expérience pour améliorer les pratiques de gouvernance IA."
    },
    "participate": {
      "title": "Participez",
      "description": "Intervenez lors d'événements, webinaires et ateliers du Cercle. Influencez la feuille de route du produit."
    },
    "access": {
      "title": "Accédez",
      "description": "Accès complet à tous les modules du portail (niveau Expert), badge Honoraire, visibilité prioritaire dans l'annuaire."
    }
  },
  "eligibility": {
    "title": "Qui peut candidater ?",
    "description": "Consultants, chercheurs, ingénieurs, juristes, éthiciens, responsables data/IA — tout professionnel qui œuvre dans le domaine de l'intelligence artificielle est invité à soumettre sa candidature."
  },
  "form": {
    "title": "Soumettre ma candidature",
    "fullName": "Nom complet",
    "email": "Email professionnel",
    "jobTitle": "Poste / Titre",
    "organization": "Organisation",
    "expertise": "Domaine d'expertise IA",
    "expertiseOptions": {
      "nlp": "Traitement du langage naturel (NLP)",
      "vision": "Vision par ordinateur",
      "mlops": "MLOps",
      "ethics": "Éthique IA",
      "compliance": "Conformité",
      "data_science": "Data Science",
      "research": "Recherche",
      "other": "Autre"
    },
    "linkedin": "Profil LinkedIn (optionnel)",
    "motivation": "En quelques lignes, comment souhaitez-vous contribuer au Cercle ?",
    "submit": "Soumettre ma candidature",
    "submitting": "Envoi en cours…"
  },
  "success": {
    "title": "Candidature envoyée !",
    "message": "Merci ! Votre candidature a été reçue. Notre équipe vous contactera sous 48h.",
    "backHome": "Retour à l'accueil"
  },
  "error": {
    "generic": "Une erreur est survenue. Veuillez réessayer.",
    "network": "Erreur de connexion. Vérifiez votre connexion Internet."
  },
  "validation": {
    "required": "Ce champ est requis.",
    "email": "Adresse email invalide.",
    "linkedinUrl": "URL LinkedIn invalide.",
    "motivationMin": "Veuillez écrire au moins 20 caractères."
  }
}
```

**Step 2: Create the EN translation file**

Create `src/i18n/locales/en/honorary.json`:

```json
{
  "seo": {
    "title": "Become an Honorary Member — AI Governance Circle",
    "description": "Working in AI? Join the Governance Circle as an Honorary Member and help shape responsible AI governance."
  },
  "hero": {
    "title": "Become an Honorary Member",
    "subtitle": "Working in AI? Join the Circle and help shape the responsible governance of tomorrow."
  },
  "why": {
    "title": "Why become an Honorary Member?",
    "contribute": {
      "title": "Contribute",
      "description": "Share your expertise, ideas, and feedback to improve AI governance practices."
    },
    "participate": {
      "title": "Participate",
      "description": "Speak at events, webinars, and workshops. Shape the product roadmap."
    },
    "access": {
      "title": "Access",
      "description": "Full access to all portal modules (Expert level), Honorary badge, priority visibility in the directory."
    }
  },
  "eligibility": {
    "title": "Who can apply?",
    "description": "Consultants, researchers, engineers, lawyers, ethicists, data/AI leaders — any professional working in artificial intelligence is invited to apply."
  },
  "form": {
    "title": "Submit my application",
    "fullName": "Full name",
    "email": "Professional email",
    "jobTitle": "Job title",
    "organization": "Organization",
    "expertise": "AI expertise area",
    "expertiseOptions": {
      "nlp": "Natural Language Processing (NLP)",
      "vision": "Computer Vision",
      "mlops": "MLOps",
      "ethics": "AI Ethics",
      "compliance": "Compliance",
      "data_science": "Data Science",
      "research": "Research",
      "other": "Other"
    },
    "linkedin": "LinkedIn profile (optional)",
    "motivation": "In a few lines, how would you like to contribute to the Circle?",
    "submit": "Submit my application",
    "submitting": "Submitting…"
  },
  "success": {
    "title": "Application sent!",
    "message": "Thank you! Your application has been received. Our team will contact you within 48 hours.",
    "backHome": "Back to home"
  },
  "error": {
    "generic": "An error occurred. Please try again.",
    "network": "Connection error. Check your Internet connection."
  },
  "validation": {
    "required": "This field is required.",
    "email": "Invalid email address.",
    "linkedinUrl": "Invalid LinkedIn URL.",
    "motivationMin": "Please write at least 20 characters."
  }
}
```

**Step 3: Register the namespace in i18n/index.ts**

Add these 2 imports after the existing `frRoadmap`/`enRoadmap` imports (lines 33 and 63):

```ts
// After line 33:
import frHonorary from './locales/fr/honorary.json'

// After line 63 (now line 64):
import enHonorary from './locales/en/honorary.json'
```

Add to both `resources` objects:

```ts
// In fr: { ... } — after line 103 (roadmap: frRoadmap,):
honorary: frHonorary,

// In en: { ... } — after line 134 (roadmap: enRoadmap,):
honorary: enHonorary,
```

Add `'honorary'` to the `ns` array at line 139:

```ts
ns: ['common', ..., 'roadmap', 'honorary'],
```

**Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/i18n/locales/fr/honorary.json src/i18n/locales/en/honorary.json src/i18n/index.ts
git commit -m "feat: ajout namespace i18n honorary (FR + EN)"
```

---

### Task 2: Create MembresHonorairesPage component

**Files:**
- Create: `src/pages/MembresHonorairesPage.tsx`

**Context:**
- Uses `useTranslation("honorary")` for all text
- Uses React Hook Form + Zod for form validation
- Uses shadcn/ui components: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- Uses Framer Motion for fade-up animations
- Hero has dark gradient background matching other vitrine pages
- Form submits to Supabase Edge Function `honorary-application`
- Named export: `export function MembresHonorairesPage()`

**Step 1: Create the page file**

Create `src/pages/MembresHonorairesPage.tsx`:

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { motion } from "framer-motion";
import { Award, Lightbulb, Mic, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ------------------------------------------------------------------ */
/*  Zod schema                                                         */
/* ------------------------------------------------------------------ */

const EXPERTISE_OPTIONS = [
  "nlp",
  "vision",
  "mlops",
  "ethics",
  "compliance",
  "data_science",
  "research",
  "other",
] as const;

function makeSchema(t: (key: string) => string) {
  return z.object({
    fullName: z.string().min(1, t("validation.required")),
    email: z.string().min(1, t("validation.required")).email(t("validation.email")),
    jobTitle: z.string().min(1, t("validation.required")),
    organization: z.string().min(1, t("validation.required")),
    expertise: z.enum(EXPERTISE_OPTIONS, { message: t("validation.required") }),
    linkedin: z
      .string()
      .url(t("validation.linkedinUrl"))
      .optional()
      .or(z.literal("")),
    motivation: z
      .string()
      .min(20, t("validation.motivationMin")),
  });
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

/* ------------------------------------------------------------------ */
/*  Value-prop cards data                                               */
/* ------------------------------------------------------------------ */

const VALUE_CARDS = [
  { key: "contribute", icon: Lightbulb },
  { key: "participate", icon: Mic },
  { key: "access", icon: ShieldCheck },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function MembresHonorairesPage() {
  const { t } = useTranslation("honorary");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = makeSchema(t);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      jobTitle: "",
      organization: "",
      expertise: undefined,
      linkedin: "",
      motivation: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const { error } = await supabase.functions.invoke("honorary-application", {
        body: data,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      setServerError(t("error.generic"));
    }
  };

  return (
    <>
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
      />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1e1a30] via-[#252243] to-[#1e1a30] py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(171,84,243,0.15),_transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Award className="size-8 text-purple-400" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Why section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center mb-12"
          >
            {t("why.title")}
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {VALUE_CARDS.map(({ key, icon: Icon }) => (
              <motion.div
                key={key}
                variants={fadeUp}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center"
              >
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-purple/10">
                  <Icon className="size-6 text-brand-purple" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {t(`why.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`why.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Eligibility ────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              {t("eligibility.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("eligibility.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Form ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-2xl px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {submitted ? (
              /* Success state */
              <div className="text-center rounded-2xl border border-green-200 bg-green-50 p-10 dark:border-green-900 dark:bg-green-950/30">
                <CheckCircle2 className="mx-auto size-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{t("success.title")}</h3>
                <p className="text-muted-foreground mb-6">{t("success.message")}</p>
                <Button asChild variant="outline">
                  <Link to="/">
                    {t("success.backHome")}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              /* Form */
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center">
                  {t("form.title")}
                </h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Row: fullName + email */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.fullName")}</FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.email")}</FormLabel>
                            <FormControl>
                              <Input type="email" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row: jobTitle + organization */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.jobTitle")}</FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("form.organization")}</FormLabel>
                            <FormControl>
                              <Input className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Expertise select */}
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.expertise")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXPERTISE_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {t(`form.expertiseOptions.${opt}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* LinkedIn (optional) */}
                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.linkedin")}</FormLabel>
                          <FormControl>
                            <Input
                              className="h-11"
                              placeholder="https://linkedin.com/in/..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Motivation */}
                    <FormField
                      control={form.control}
                      name="motivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("form.motivation")}</FormLabel>
                          <FormControl>
                            <Textarea rows={5} className="min-h-[120px] resize-y" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Server error */}
                    {serverError && (
                      <p className="text-sm text-destructive text-center">{serverError}</p>
                    )}

                    {/* Submit */}
                    <div className="pt-2 text-center">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={form.formState.isSubmitting}
                        className="rounded-full bg-gradient-to-r from-[#ab54f3] to-[#7c2cd4] px-8 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110 transition-all"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            {t("form.submitting")}
                          </>
                        ) : (
                          <>
                            {t("form.submit")}
                            <ArrowRight className="ml-2 size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: No errors (the page isn't routed yet, but imports should resolve).

**Step 3: Commit**

```bash
git add src/pages/MembresHonorairesPage.tsx
git commit -m "feat: page Membres Honoraires avec formulaire de candidature"
```

---

### Task 3: Add route and import in App.tsx

**Files:**
- Modify: `src/App.tsx:18,129`

**Step 1: Add the import**

After line 18 (`import { TarifsPage } ...`), add:

```tsx
import { MembresHonorairesPage } from "@/pages/MembresHonorairesPage";
```

**Step 2: Add the route**

After line 129 (`<Route path="/fonctionnalites" ...>`), add inside the `<Layout>` block:

```tsx
            <Route path="/membres-honoraires" element={<MembresHonorairesPage />} />
```

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: ajout route /membres-honoraires"
```

---

### Task 4: Upgrade the honorary banner on TarifsPage

**Files:**
- Modify: `src/pages/TarifsPage.tsx:547-556`
- Modify: `src/i18n/locales/fr/billing.json`
- Modify: `src/i18n/locales/en/billing.json`

**Step 1: Update billing.json i18n keys**

In `src/i18n/locales/fr/billing.json`, replace:

```json
"honoraryBanner": "Le Cercle accueille aussi des Membres Honoraires, sommités nommées par le Conseil d'administration.",
"honoraryLearnMore": "En savoir plus"
```

with:

```json
"honoraryBanner": {
  "title": "Membre Honoraire",
  "subtitle": "Vous œuvrez dans l'IA ? Contribuez au Cercle et accédez gratuitement à tous les modules.",
  "cta": "Devenir Membre Honoraire"
}
```

In `src/i18n/locales/en/billing.json`, replace:

```json
"honoraryBanner": "The Circle also welcomes Honorary Members, luminaries nominated by the Board of Directors.",
"honoraryLearnMore": "Learn more"
```

with:

```json
"honoraryBanner": {
  "title": "Honorary Member",
  "subtitle": "Working in AI? Contribute to the Circle and get free access to all modules.",
  "cta": "Become an Honorary Member"
}
```

**Step 2: Replace the banner section in TarifsPage.tsx**

In `src/pages/TarifsPage.tsx`, add `Award` to the Lucide import (line with other icons). Then replace lines 547–556 (the entire `HONORARY MEMBERS BANNER` section) with:

```tsx
      {/* ============================================================ */}
      {/*  HONORARY MEMBERS BANNER                                       */}
      {/* ============================================================ */}
      <section className="pb-10 sm:pb-14">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/membres-honoraires"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-6 sm:p-8 text-center hover:border-brand-purple/40 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
          >
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-purple/10">
              <Award className="size-5 text-brand-purple" />
            </div>
            <h3 className="text-lg font-bold mb-1">{t("honoraryBanner.title")}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
              {t("honoraryBanner.subtitle")}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple group-hover:gap-2.5 transition-all">
              {t("honoraryBanner.cta")}
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </section>
```

Note: `Link` and `ArrowRight` are already imported in TarifsPage.tsx. Only `Award` needs to be added to the Lucide import.

**Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/pages/TarifsPage.tsx src/i18n/locales/fr/billing.json src/i18n/locales/en/billing.json
git commit -m "feat: banner Membre Honoraire avec CTA sur page Tarifs"
```

---

### Task 5: Create Edge Function `honorary-application`

**Files:**
- Create: `supabase/functions/honorary-application/index.ts`

**Context:**
- Follows the same Deno pattern as `stripe-checkout` (CORS headers, `Deno.serve`, JSON response helpers)
- No authentication required (public form)
- Sends an email to the admin with the application details
- Uses Resend API (simple HTTP POST) — requires `RESEND_API_KEY` and `ADMIN_EMAIL` env vars in Supabase secrets
- If Resend is not configured, falls back to logging the application (graceful degradation)

**Step 1: Create the Edge Function**

Create `supabase/functions/honorary-application/index.ts`:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface ApplicationPayload {
  fullName: string;
  email: string;
  jobTitle: string;
  organization: string;
  expertise: string;
  linkedin?: string;
  motivation: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json()) as ApplicationPayload;

    // Basic server-side validation
    if (!body.fullName || !body.email || !body.jobTitle || !body.organization || !body.expertise || !body.motivation) {
      return jsonResponse({ error: "Missing required fields" }, 400);
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "admin@gouvernance.ai";

    if (!RESEND_API_KEY) {
      // Graceful fallback: log the application
      console.log("RESEND_API_KEY not set. Application logged:", JSON.stringify(body));
      return jsonResponse({ success: true, method: "logged" });
    }

    const expertiseLabels: Record<string, string> = {
      nlp: "NLP",
      vision: "Vision par ordinateur",
      mlops: "MLOps",
      ethics: "Éthique IA",
      compliance: "Conformité",
      data_science: "Data Science",
      research: "Recherche",
      other: "Autre",
    };

    const htmlBody = `
      <h2>Nouvelle candidature — Membre Honoraire</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Nom</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.fullName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Poste</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.jobTitle}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Organisation</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.organization}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Expertise</td><td style="padding:8px;border-bottom:1px solid #eee;">${expertiseLabels[body.expertise] ?? body.expertise}</td></tr>
        ${body.linkedin ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">LinkedIn</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${body.linkedin}">${body.linkedin}</a></td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Motivation</td><td style="padding:8px;border-bottom:1px solid #eee;">${body.motivation}</td></tr>
      </table>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cercle de Gouvernance IA <noreply@gouvernance.ai>",
        to: [ADMIN_EMAIL],
        reply_to: body.email,
        subject: `Candidature Membre Honoraire — ${body.fullName}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return jsonResponse({ error: "Failed to send email" }, 502);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
```

**Step 2: Verify file exists**

Run: `ls supabase/functions/honorary-application/index.ts`
Expected: File listed.

**Step 3: Commit**

```bash
git add supabase/functions/honorary-application/index.ts
git commit -m "feat: edge function honorary-application (envoi email candidature)"
```

---

### Task 6: Final verification and push

**Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 2: Build**

Run: `npm run build`
Expected: Build succeeds.

**Step 3: Push**

```bash
git push
```
