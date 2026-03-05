import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bot,
  Shield,
  AlertTriangle,
  Scale,
  FileText,
  BarChart3,
  Eye,
  Recycle,
  Building2,
  FolderOpen,
  Activity,
  Database,
  CheckCircle,
  Clock,
  Send,
  Archive,
  Cpu,
  Sparkles,
  BookOpenCheck,
  Newspaper,
  BookOpen,
  Library,
  Lightbulb,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const availableModules: { icon: LucideIcon; key: string }[] = [
  { icon: Bot, key: "aiSystems" },
  { icon: Shield, key: "risks" },
  { icon: AlertTriangle, key: "incidents" },
  { icon: Scale, key: "governance" },
  { icon: FileText, key: "decisions" },
  { icon: CheckCircle, key: "compliance" },
  { icon: BarChart3, key: "bias" },
  { icon: Eye, key: "transparency" },
  { icon: Recycle, key: "lifecycle" },
  { icon: Building2, key: "vendors" },
  { icon: FolderOpen, key: "documents" },
  { icon: Activity, key: "monitoring" },
  { icon: Database, key: "data" },
  { icon: Newspaper, key: "veille" },
  { icon: BookOpen, key: "bibliotheque" },
  { icon: Library, key: "modeles" },
  { icon: Cpu, key: "agents" },
];

const upcomingFeatures: {
  icon: LucideIcon;
  key: string;
  color: string;
  bgColor: string;
  borderAccent: string;
}[] = [
  {
    icon: Send,
    key: "vendorQuestionnaire",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderAccent: "hover:border-blue-200",
  },
  {
    icon: Archive,
    key: "documentDrive",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderAccent: "hover:border-amber-200",
  },
  {
    icon: BookOpenCheck,
    key: "legalChat",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderAccent: "hover:border-teal-200",
  },
  {
    icon: Cpu,
    key: "mcpServer",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderAccent: "hover:border-emerald-200",
  },
];

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

const FORM_CATEGORIES = [
  "newModule",
  "improvement",
  "integration",
  "reporting",
  "other",
] as const;

export default function RoadmapPage() {
  const { t } = useTranslation("roadmap");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("form-name", "feature-request");
      formData.set("category", category);
      const body = new URLSearchParams(formData as unknown as Record<string, string>);
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSubmitted(true);
    } catch {
      setFormError(t("form.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-forest/10">
          <Sparkles className="h-5 w-5 text-brand-forest" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  SECTION 1 — Already available                                */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t("available.title")}</h2>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            {t("available.badge", { count: availableModules.length })}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {availableModules.map((mod) => (
            <Card key={mod.key} className="group border-border/60 hover:shadow-sm hover:border-emerald-200/60 transition-all duration-300">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <mod.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t(`modules.${mod.key}.title`)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(`modules.${mod.key}.description`)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — Coming soon                                      */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest/10">
            <Clock className="h-4 w-4 text-brand-forest" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t("upcoming.title")}</h2>
          <Badge variant="secondary" className="bg-brand-forest/10 text-brand-forest border-brand-forest/20 text-xs">
            {t("upcoming.badge")}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {upcomingFeatures.map((feature) => (
            <Card
              key={feature.key}
              className={`group border-2 border-dashed border-border/60 ${feature.borderAccent} transition-all duration-300 relative overflow-hidden`}
            >
              <CardHeader className="pb-3">
                <Badge variant="outline" className="absolute top-4 right-4 text-[11px] font-medium">
                  {t("upcoming.tag")}
                </Badge>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color} mb-3`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base pr-16 leading-snug">{t(`features.${feature.key}.title`)}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-5">
                <ul className="space-y-2.5">
                  {[1, 2, 3, 4].map((n) => (
                    <li key={n} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand-forest/50" />
                      <span className="leading-tight">{t(`features.${feature.key}.bullet${n}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — Feature request form                              */}
      {/* ============================================================ */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Lightbulb className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{t("form.title")}</h2>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mb-4">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-lg">{t("form.successTitle")}</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {t("form.successMessage")}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSubmitted(false)}
                >
                  {t("form.another")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <input type="hidden" name="form-name" value="feature-request" />
                <p className="hidden">
                  <label>
                    Ne pas remplir : <input name="bot-field" />
                  </label>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fr-name">{t("form.nameLabel")}</Label>
                    <Input
                      id="fr-name"
                      name="name"
                      required
                      placeholder={t("form.namePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fr-email">{t("form.emailLabel")}</Label>
                    <Input
                      id="fr-email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("form.emailPlaceholder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("form.categoryLabel")}</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.categoryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {FORM_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {t(`form.categories.${cat}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fr-title">{t("form.featureTitleLabel")}</Label>
                    <Input
                      id="fr-title"
                      name="title"
                      required
                      placeholder={t("form.featureTitlePlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fr-description">{t("form.descriptionLabel")}</Label>
                  <Textarea
                    id="fr-description"
                    name="description"
                    required
                    rows={4}
                    placeholder={t("form.descriptionPlaceholder")}
                  />
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t("form.submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
