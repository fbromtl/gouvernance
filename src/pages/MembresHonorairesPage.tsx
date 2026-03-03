import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    resolver: zodResolver(schema) as any,
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
