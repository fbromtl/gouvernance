import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCreateIncident } from "@/hooks/useIncidents";

/* ------------------------------------------------------------------ */
/*  Option constants                                                    */
/* ------------------------------------------------------------------ */

const AI_INCIDENT_TYPES = [
  "performance",
  "security",
  "bias",
  "ethics",
  "availability",
  "compliance",
  "unauthorized_use",
] as const;

const PRIVACY_INCIDENT_TYPES = [
  "unauthorized_access",
  "unauthorized_use_data",
  "unauthorized_disclosure",
  "data_loss",
  "data_theft",
  "other_breach",
] as const;

const DETECTION_MODES = [
  "automated_monitoring",
  "user_report",
  "internal_audit",
  "external_report",
  "media",
  "regulatory",
] as const;

const SEVERITIES = ["critical", "high", "medium", "low"] as const;

const SEVERITY_INDICATORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

/* ------------------------------------------------------------------ */
/*  Zod schema                                                          */
/* ------------------------------------------------------------------ */

const incidentSchema = z.object({
  title: z.string().min(1, "required"),
  category: z.enum(["ai", "privacy"]),
  incident_type: z.string().min(1, "required"),
  ai_system_id: z.string().optional(),
  description: z.string().min(1, "required"),
  detected_at: z.string().min(1, "required"),
  started_at: z.string().optional(),
  detection_mode: z.string().optional(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  serious_harm_risk: z.boolean().default(false),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function IncidentReportPage() {
  const { t } = useTranslation("incidents");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createIncident = useCreateIncident();

  // Default detected_at to now in local datetime format
  const now = new Date();
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: "",
      category: "ai",
      incident_type: "",
      ai_system_id: searchParams.get("ai_system_id") ?? "",
      description: "",
      detected_at: localIso,
      started_at: "",
      detection_mode: "",
      severity: "medium",
      serious_harm_risk: false,
    },
  });

  const selectedCategory = watch("category");
  const seriousHarmRisk = watch("serious_harm_risk");

  // Reset incident_type when category changes
  useEffect(() => {
    setValue("incident_type", "");
  }, [selectedCategory, setValue]);

  // Pre-fill ai_system_id from query param
  useEffect(() => {
    const aiSystemId = searchParams.get("ai_system_id");
    if (aiSystemId) {
      setValue("ai_system_id", aiSystemId);
    }
  }, [searchParams, setValue]);

  const incidentTypeOptions =
    selectedCategory === "ai" ? AI_INCIDENT_TYPES : PRIVACY_INCIDENT_TYPES;

  /* ---------- Submit ------------------------------------------------ */

  const onSubmit = async (data: IncidentFormData) => {
    try {
      const result = await createIncident.mutateAsync({
        title: data.title,
        category: data.category,
        incident_type: data.incident_type,
        ai_system_id: data.ai_system_id || null,
        description: data.description,
        detected_at: new Date(data.detected_at).toISOString(),
        started_at: data.started_at
          ? new Date(data.started_at).toISOString()
          : null,
        detection_mode: data.detection_mode || null,
        severity: data.severity,
        serious_harm_risk: data.serious_harm_risk,
      });
      toast.success(t("toast.created"));
      navigate(`/incidents/${result.id}`);
    } catch {
      toast.error("Erreur lors de la creation de l'incident.");
    }
  };

  /* ---------- Render ------------------------------------------------ */

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/incidents")}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        {t("detail.backToList")}
      </Button>

      <PageHeader
        title={t("form.title")}
        description={t("form.description")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("form.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{t("form.incidentTitle")} *</Label>
              <Input
                id="title"
                placeholder={t("form.incidentTitlePlaceholder")}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{t("form.required")}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t("form.category")} *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="ai" id="cat-ai" />
                      <Label htmlFor="cat-ai" className="font-normal cursor-pointer">
                        {t("categories.ai")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="privacy" id="cat-privacy" />
                      <Label htmlFor="cat-privacy" className="font-normal cursor-pointer">
                        {t("categories.privacy")}
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Incident type */}
            <div className="space-y-2">
              <Label>{t("form.incidentType")} *</Label>
              <Controller
                name="incident_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {t(`incidentTypes.${selectedCategory}.${type}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.incident_type && (
                <p className="text-sm text-destructive">{t("form.required")}</p>
              )}
            </div>

            {/* AI System ID */}
            <div className="space-y-2">
              <Label htmlFor="ai_system_id">{t("form.aiSystemId")}</Label>
              <Input
                id="ai_system_id"
                placeholder={t("form.aiSystemIdPlaceholder")}
                {...register("ai_system_id")}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("form.incidentDescription")} *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder={t("form.incidentDescriptionPlaceholder")}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{t("form.required")}</p>
              )}
            </div>

            {/* Detected at */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="detected_at">{t("form.detectedAt")} *</Label>
                <Input
                  id="detected_at"
                  type="datetime-local"
                  {...register("detected_at")}
                />
                {errors.detected_at && (
                  <p className="text-sm text-destructive">{t("form.required")}</p>
                )}
              </div>

              {/* Started at */}
              <div className="space-y-2">
                <Label htmlFor="started_at">{t("form.startedAt")}</Label>
                <Input
                  id="started_at"
                  type="datetime-local"
                  {...register("started_at")}
                />
              </div>
            </div>

            {/* Detection mode */}
            <div className="space-y-2">
              <Label>{t("form.detectionMode")}</Label>
              <Controller
                name="detection_mode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectDetectionMode")} />
                    </SelectTrigger>
                    <SelectContent>
                      {DETECTION_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {t(`detectionModes.${mode}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>{t("form.severity")} *</Label>
              <Controller
                name="severity"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4"
                  >
                    {SEVERITIES.map((sev) => (
                      <div key={sev} className="flex items-center gap-2">
                        <RadioGroupItem value={sev} id={`sev-${sev}`} />
                        <span
                          className={`inline-block size-3 rounded-full ${SEVERITY_INDICATORS[sev]}`}
                        />
                        <Label htmlFor={`sev-${sev}`} className="font-normal cursor-pointer">
                          {t(`severities.${sev}`)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            {/* Serious harm risk */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Controller
                  name="serious_harm_risk"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="serious_harm_risk"
                    />
                  )}
                />
                <Label htmlFor="serious_harm_risk" className="cursor-pointer">
                  {t("form.seriousHarmRisk")}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("form.seriousHarmRiskDescription")}
              </p>

              {seriousHarmRisk && (
                <div className="mt-3 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    {t("form.loi25Alert")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("form.submitting") : t("form.submit")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/incidents")}
          >
            {t("form.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
