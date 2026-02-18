import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Fingerprint,
  Target,
  Database,
  Users,
  Settings,
} from "lucide-react";

import { FormWizard } from "@/components/shared/FormWizard";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

import {
  useAiSystem,
  useCreateAiSystem,
  useUpdateAiSystem,
  calculateRiskScoreClient,
} from "@/hooks/useAiSystems";
import type { AiSystemInsert } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Option lists                                                        */
/* ------------------------------------------------------------------ */

const SYSTEM_TYPES = [
  "predictive_ml",
  "rules_based",
  "genai_text",
  "genai_image",
  "genai_code",
  "genai_multimodal",
  "nlp",
  "computer_vision",
  "robotics",
  "recommendation",
  "other",
] as const;

const GENAI_SUBTYPES = [
  "chatbot",
  "content_generation",
  "code_assistant",
  "image_generation",
  "summarization",
  "translation",
  "other",
] as const;

const DEPARTMENTS = [
  "it",
  "hr",
  "finance",
  "marketing",
  "sales",
  "legal",
  "operations",
  "customer_service",
  "r_and_d",
  "executive",
] as const;

const AFFECTED_POPULATIONS = [
  "employees",
  "customers",
  "prospects",
  "public",
  "minors",
  "vulnerable",
] as const;

const ESTIMATED_VOLUMES = [
  "under_100",
  "100_1000",
  "1000_10000",
  "10000_100000",
  "over_100000",
] as const;

const AUTONOMY_LEVELS = [
  "human_in_command",
  "human_in_the_loop",
  "human_on_the_loop",
  "full_auto",
] as const;

const SENSITIVE_DOMAINS = [
  "biometric_id",
  "justice",
  "migration",
  "critical_infra",
  "health",
  "employment",
  "credit",
  "education",
  "housing",
] as const;

const DATA_TYPES = [
  "no_personal_data",
  "public_data",
  "synthetic_data",
  "personal_data",
  "financial_data",
  "sensitive_data",
] as const;

const SYSTEM_SOURCES = ["internal", "vendor", "open_source", "hybrid"] as const;

const DATA_LOCATIONS = [
  "canada",
  "usa",
  "eu",
  "uk",
  "other_international",
] as const;

const LIFECYCLE_STATUSES = [
  "idea",
  "pilot",
  "development",
  "testing",
  "production",
  "suspended",
  "decommissioned",
] as const;

const REVIEW_FREQUENCIES = [
  "monthly",
  "quarterly",
  "semi_annual",
  "annual",
] as const;

/* ------------------------------------------------------------------ */
/*  Zod schema                                                          */
/* ------------------------------------------------------------------ */

const formSchema = z.object({
  // Step 1 - Identification
  name: z.string().min(1),
  description: z.string().min(1),
  internal_ref: z.string().nullable().optional(),
  system_type: z.string().min(1),
  genai_subtype: z.string().nullable().optional(),

  // Step 2 - Scope & Impact
  departments: z.array(z.string()).default([]),
  purpose: z.string().nullable().optional(),
  affected_population: z.array(z.string()).default([]),
  estimated_volume: z.string().nullable().optional(),
  autonomy_level: z.string().nullable().optional(),
  sensitive_domains: z.array(z.string()).default([]),

  // Step 3 - Data & Vendor
  data_types: z.array(z.string()).default([]),
  system_source: z.string().nullable().optional(),
  vendor_name: z.string().nullable().optional(),
  model_version: z.string().nullable().optional(),
  data_locations: z.array(z.string()).default([]),

  // Step 4 - Owners
  business_owner_id: z.string().nullable().optional(),
  tech_owner_id: z.string().nullable().optional(),
  privacy_owner_id: z.string().nullable().optional(),
  risk_owner_id: z.string().nullable().optional(),
  approver_id: z.string().nullable().optional(),

  // Step 5 - Status & Planning
  lifecycle_status: z.string().default("idea"),
  production_date: z.string().nullable().optional(),
  next_review_date: z.string().nullable().optional(),
  review_frequency: z.string().default("quarterly"),
  notes: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* ------------------------------------------------------------------ */
/*  Wizard steps config                                                 */
/* ------------------------------------------------------------------ */

function useWizardSteps(t: (key: string) => string) {
  return useMemo(
    () => [
      {
        id: "identification",
        label: t("wizard.steps.identification"),
        description: t("wizard.steps.identificationDesc"),
        icon: Fingerprint,
      },
      {
        id: "scope",
        label: t("wizard.steps.scope"),
        description: t("wizard.steps.scopeDesc"),
        icon: Target,
      },
      {
        id: "data",
        label: t("wizard.steps.data"),
        description: t("wizard.steps.dataDesc"),
        icon: Database,
      },
      {
        id: "owners",
        label: t("wizard.steps.owners"),
        description: t("wizard.steps.ownersDesc"),
        icon: Users,
      },
      {
        id: "status",
        label: t("wizard.steps.status"),
        description: t("wizard.steps.statusDesc"),
        icon: Settings,
      },
    ],
    [t],
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable: multi-checkbox field                                      */
/* ------------------------------------------------------------------ */

function MultiCheckboxField({
  options,
  value,
  onChange,
  labelFn,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  labelFn: (opt: string) => string;
}) {
  function toggle(opt: string) {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt],
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2 cursor-pointer text-sm"
        >
          <Checkbox
            checked={value.includes(opt)}
            onCheckedChange={() => toggle(opt)}
          />
          {labelFn(opt)}
        </label>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */

export default function AiSystemWizardPage() {
  const { t } = useTranslation("aiSystems");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [step, setStep] = useState(0);
  const steps = useWizardSteps(t);

  // ----- Data fetching (edit mode) -----
  const { data: existingSystem, isLoading: isLoadingSystem } = useAiSystem(
    isEdit ? id : undefined,
  );

  // ----- Mutations -----
  const createMutation = useCreateAiSystem();
  const updateMutation = useUpdateAiSystem();

  // ----- Form -----
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      internal_ref: "",
      system_type: "",
      genai_subtype: "",
      departments: [],
      purpose: "",
      affected_population: [],
      estimated_volume: "",
      autonomy_level: "",
      sensitive_domains: [],
      data_types: [],
      system_source: "",
      vendor_name: "",
      model_version: "",
      data_locations: [],
      business_owner_id: "",
      tech_owner_id: "",
      privacy_owner_id: "",
      risk_owner_id: "",
      approver_id: "",
      lifecycle_status: "idea",
      production_date: "",
      next_review_date: "",
      review_frequency: "quarterly",
      notes: "",
    },
  });

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Pre-populate in edit mode
  useEffect(() => {
    if (existingSystem) {
      reset({
        name: existingSystem.name,
        description: existingSystem.description,
        internal_ref: existingSystem.internal_ref ?? "",
        system_type: existingSystem.system_type,
        genai_subtype: existingSystem.genai_subtype ?? "",
        departments: existingSystem.departments ?? [],
        purpose: existingSystem.purpose ?? "",
        affected_population: existingSystem.affected_population ?? [],
        estimated_volume: existingSystem.estimated_volume ?? "",
        autonomy_level: existingSystem.autonomy_level ?? "",
        sensitive_domains: existingSystem.sensitive_domains ?? [],
        data_types: existingSystem.data_types ?? [],
        system_source: existingSystem.system_source ?? "",
        vendor_name: existingSystem.vendor_name ?? "",
        model_version: existingSystem.model_version ?? "",
        data_locations: existingSystem.data_locations ?? [],
        business_owner_id: existingSystem.business_owner_id ?? "",
        tech_owner_id: existingSystem.tech_owner_id ?? "",
        privacy_owner_id: existingSystem.privacy_owner_id ?? "",
        risk_owner_id: existingSystem.risk_owner_id ?? "",
        approver_id: existingSystem.approver_id ?? "",
        lifecycle_status: existingSystem.lifecycle_status,
        production_date: existingSystem.production_date ?? "",
        next_review_date: existingSystem.next_review_date ?? "",
        review_frequency: existingSystem.review_frequency,
        notes: existingSystem.notes ?? "",
      });
    }
  }, [existingSystem, reset]);

  // ----- Live risk score preview -----
  const watchedValues = watch();
  const riskPreview = useMemo(
    () =>
      calculateRiskScoreClient({
        autonomy_level: watchedValues.autonomy_level || undefined,
        data_types: watchedValues.data_types,
        affected_population: watchedValues.affected_population,
        sensitive_domains: watchedValues.sensitive_domains,
      } as Partial<AiSystemInsert>),
    [
      watchedValues.autonomy_level,
      watchedValues.data_types,
      watchedValues.affected_population,
      watchedValues.sensitive_domains,
    ],
  );

  // ----- Conditional visibility -----
  const systemTypeValue = watch("system_type");
  const showGenaiSubtype = systemTypeValue?.includes("genai");

  const systemSourceValue = watch("system_source");
  const showVendorFields =
    systemSourceValue === "vendor" || systemSourceValue === "hybrid";

  // ----- canGoNext per step -----
  const canGoNext = useMemo(() => {
    switch (step) {
      case 0:
        return !!watchedValues.name && !!watchedValues.description && !!watchedValues.system_type;
      default:
        return true;
    }
  }, [step, watchedValues.name, watchedValues.description, watchedValues.system_type]);

  // ----- Submit -----
  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        name: values.name,
        description: values.description,
        internal_ref: values.internal_ref || null,
        system_type: values.system_type,
        genai_subtype: values.genai_subtype || null,
        departments: values.departments,
        purpose: values.purpose || null,
        affected_population: values.affected_population,
        estimated_volume: values.estimated_volume || null,
        autonomy_level: values.autonomy_level || null,
        sensitive_domains: values.sensitive_domains,
        data_types: values.data_types,
        system_source: values.system_source || null,
        vendor_name: values.vendor_name || null,
        model_version: values.model_version || null,
        data_locations: values.data_locations,
        business_owner_id: values.business_owner_id || null,
        tech_owner_id: values.tech_owner_id || null,
        privacy_owner_id: values.privacy_owner_id || null,
        risk_owner_id: values.risk_owner_id || null,
        approver_id: values.approver_id || null,
        lifecycle_status: values.lifecycle_status,
        production_date: values.production_date || null,
        next_review_date: values.next_review_date || null,
        review_frequency: values.review_frequency,
        notes: values.notes || null,
      };

      if (isEdit && id) {
        const result = await updateMutation.mutateAsync({ id, ...payload });
        toast.success(t("wizard.updateSuccess"));
        navigate(`/ai-systems/${result.id}`);
      } else {
        const result = await createMutation.mutateAsync(payload);
        toast.success(t("wizard.createSuccess"));
        navigate(`/ai-systems/${result.id}`);
      }
    } catch {
      toast.error(t("wizard.error"));
    }
  }

  // ----- Loading state (edit mode) -----
  if (isEdit && isLoadingSystem) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ----- Field helper -----
  function fieldError(name: keyof FormValues) {
    const err = errors[name];
    if (!err) return null;
    return (
      <p className="text-sm text-destructive mt-1">
        {t("wizard.fieldRequired")}
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        {isEdit ? t("wizard.editTitle") : t("wizard.createTitle")}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main wizard form */}
        <div className="flex-1">
          <FormWizard
            steps={steps}
            currentStep={step}
            onStepChange={setStep}
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            canGoNext={canGoNext}
            submitLabel={
              isEdit ? t("wizard.submitUpdate") : t("wizard.submitCreate")
            }
            draftLabel={t("wizard.saveDraft")}
          >
            {/* ---- Step 1: Identification ---- */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="name">{t("fields.name")} *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={t("fields.namePlaceholder")}
                  />
                  {fieldError("name")}
                </div>

                <div>
                  <Label htmlFor="description">{t("fields.description")} *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    rows={4}
                    placeholder={t("fields.descriptionPlaceholder")}
                  />
                  {fieldError("description")}
                </div>

                <div>
                  <Label htmlFor="internal_ref">{t("fields.internalRef")}</Label>
                  <Input
                    id="internal_ref"
                    {...register("internal_ref")}
                    placeholder={t("fields.internalRefPlaceholder")}
                  />
                </div>

                <div>
                  <Label>{t("fields.systemType")} *</Label>
                  <Controller
                    name="system_type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                      >
                        {SYSTEM_TYPES.map((st) => (
                          <label
                            key={st}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <RadioGroupItem value={st} />
                            {t(`systemTypes.${st}`)}
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {fieldError("system_type")}
                </div>

                {showGenaiSubtype && (
                  <div>
                    <Label>{t("fields.genaiSubtype")}</Label>
                    <Controller
                      name="genai_subtype"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                        >
                          {GENAI_SUBTYPES.map((gs) => (
                            <label
                              key={gs}
                              className="flex items-center gap-2 cursor-pointer text-sm"
                            >
                              <RadioGroupItem value={gs} />
                              {t(`genaiSubtypes.${gs}`)}
                            </label>
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ---- Step 2: Scope & Impact ---- */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label>{t("fields.departments")}</Label>
                  <Controller
                    name="departments"
                    control={control}
                    render={({ field }) => (
                      <MultiCheckboxField
                        options={DEPARTMENTS}
                        value={field.value}
                        onChange={field.onChange}
                        labelFn={(opt) => t(`departments.${opt}`)}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="purpose">{t("fields.purpose")}</Label>
                  <Textarea
                    id="purpose"
                    {...register("purpose")}
                    rows={3}
                    placeholder={t("fields.purposePlaceholder")}
                  />
                </div>

                <div>
                  <Label>{t("fields.affectedPopulation")}</Label>
                  <Controller
                    name="affected_population"
                    control={control}
                    render={({ field }) => (
                      <MultiCheckboxField
                        options={AFFECTED_POPULATIONS}
                        value={field.value}
                        onChange={field.onChange}
                        labelFn={(opt) => t(`affectedPopulations.${opt}`)}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>{t("fields.estimatedVolume")}</Label>
                  <Controller
                    name="estimated_volume"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("fields.estimatedVolumePlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTIMATED_VOLUMES.map((v) => (
                            <SelectItem key={v} value={v}>
                              {t(`estimatedVolumes.${v}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label>{t("fields.autonomyLevel")}</Label>
                  <Controller
                    name="autonomy_level"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                      >
                        {AUTONOMY_LEVELS.map((al) => (
                          <label
                            key={al}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <RadioGroupItem value={al} />
                            {t(`autonomyLevels.${al}`)}
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </div>

                <div>
                  <Label>{t("fields.sensitiveDomains")}</Label>
                  <Controller
                    name="sensitive_domains"
                    control={control}
                    render={({ field }) => (
                      <MultiCheckboxField
                        options={SENSITIVE_DOMAINS}
                        value={field.value}
                        onChange={field.onChange}
                        labelFn={(opt) => t(`sensitiveDomains.${opt}`)}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* ---- Step 3: Data & Vendor ---- */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label>{t("fields.dataTypes")}</Label>
                  <Controller
                    name="data_types"
                    control={control}
                    render={({ field }) => (
                      <MultiCheckboxField
                        options={DATA_TYPES}
                        value={field.value}
                        onChange={field.onChange}
                        labelFn={(opt) => t(`dataTypes.${opt}`)}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label>{t("fields.systemSource")}</Label>
                  <Controller
                    name="system_source"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                      >
                        {SYSTEM_SOURCES.map((ss) => (
                          <label
                            key={ss}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <RadioGroupItem value={ss} />
                            {t(`systemSources.${ss}`)}
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </div>

                {showVendorFields && (
                  <>
                    <div>
                      <Label htmlFor="vendor_name">
                        {t("fields.vendorName")}
                      </Label>
                      <Input
                        id="vendor_name"
                        {...register("vendor_name")}
                        placeholder={t("fields.vendorNamePlaceholder")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="model_version">
                        {t("fields.modelVersion")}
                      </Label>
                      <Input
                        id="model_version"
                        {...register("model_version")}
                        placeholder={t("fields.modelVersionPlaceholder")}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>{t("fields.dataLocations")}</Label>
                  <Controller
                    name="data_locations"
                    control={control}
                    render={({ field }) => (
                      <MultiCheckboxField
                        options={DATA_LOCATIONS}
                        value={field.value}
                        onChange={field.onChange}
                        labelFn={(opt) => t(`dataLocations.${opt}`)}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* ---- Step 4: Owners ---- */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="business_owner_id">
                    {t("fields.businessOwner")}
                  </Label>
                  <Input
                    id="business_owner_id"
                    {...register("business_owner_id")}
                    placeholder={t("fields.ownerPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="tech_owner_id">
                    {t("fields.techOwner")}
                  </Label>
                  <Input
                    id="tech_owner_id"
                    {...register("tech_owner_id")}
                    placeholder={t("fields.ownerPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="privacy_owner_id">
                    {t("fields.privacyOwner")}
                  </Label>
                  <Input
                    id="privacy_owner_id"
                    {...register("privacy_owner_id")}
                    placeholder={t("fields.ownerPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="risk_owner_id">
                    {t("fields.riskOwner")}
                  </Label>
                  <Input
                    id="risk_owner_id"
                    {...register("risk_owner_id")}
                    placeholder={t("fields.ownerPlaceholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="approver_id">
                    {t("fields.approver")}
                  </Label>
                  <Input
                    id="approver_id"
                    {...register("approver_id")}
                    placeholder={t("fields.ownerPlaceholder")}
                  />
                </div>
              </div>
            )}

            {/* ---- Step 5: Status & Planning ---- */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <Label>{t("fields.lifecycleStatus")}</Label>
                  <Controller
                    name="lifecycle_status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LIFECYCLE_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {t(`lifecycleStatuses.${s}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="production_date">
                    {t("fields.productionDate")}
                  </Label>
                  <Input
                    id="production_date"
                    type="date"
                    {...register("production_date")}
                  />
                </div>

                <div>
                  <Label htmlFor="next_review_date">
                    {t("fields.nextReviewDate")}
                  </Label>
                  <Input
                    id="next_review_date"
                    type="date"
                    {...register("next_review_date")}
                  />
                </div>

                <div>
                  <Label>{t("fields.reviewFrequency")}</Label>
                  <Controller
                    name="review_frequency"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REVIEW_FREQUENCIES.map((rf) => (
                            <SelectItem key={rf} value={rf}>
                              {t(`reviewFrequencies.${rf}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t("fields.notes")}</Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    rows={4}
                    placeholder={t("fields.notesPlaceholder")}
                  />
                </div>
              </div>
            )}
          </FormWizard>
        </div>

        {/* Risk score sidebar preview */}
        <div className="lg:w-48 shrink-0">
          <Card className="sticky top-6">
            <CardContent className="flex flex-col items-center gap-2 pt-6">
              <p className="text-sm font-medium text-muted-foreground">
                {t("wizard.riskPreview")}
              </p>
              <RiskScoreGauge
                score={riskPreview.score}
                size="md"
                showLabel
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
