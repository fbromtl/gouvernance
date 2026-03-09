import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

import { FormWizard } from "@/components/shared/FormWizard";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PortalPage } from "@/portail/components/PortalPage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useRiskAssessment,
  useCreateRiskAssessment,
  useUpdateRiskAssessment,
  calculateAssessmentScore,
} from "@/hooks/useRiskAssessments";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ------------------------------------------------------------------ */
/*  SCHEMA                                                              */
/* ------------------------------------------------------------------ */

const schema = z.object({
  ai_system_id: z.string().min(1),
  // Section A
  q1: z.string().min(1),
  q2: z.string().min(1),
  q3: z.string().min(1),
  q4: z.array(z.string()),
  // Section B
  q5: z.string().min(1),
  q6: z.array(z.string()),
  q7: z.string().min(1),
  // Section C
  q8: z.string().min(1),
  q9: z.string().min(1),
  q10: z.string().min(1),
  // Section D
  q11: z.string().min(1),
  q12: z.string().min(1),
  q13: z.string().min(1),
  // Section E
  q14: z.string().min(1),
  q15: z.string().min(1),
  // Section F
  q16: z.string().min(1),
  q17: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

/* ------------------------------------------------------------------ */
/*  SECTION DEFINITIONS                                                 */
/* ------------------------------------------------------------------ */

interface QuestionDef {
  id: keyof FormValues;
  type: "radio" | "checkbox";
}

const SECTIONS: { key: string; questions: QuestionDef[] }[] = [
  {
    key: "A",
    questions: [
      { id: "q1", type: "radio" },
      { id: "q2", type: "radio" },
      { id: "q3", type: "radio" },
      { id: "q4", type: "checkbox" },
    ],
  },
  {
    key: "B",
    questions: [
      { id: "q5", type: "radio" },
      { id: "q6", type: "checkbox" },
      { id: "q7", type: "radio" },
    ],
  },
  {
    key: "C",
    questions: [
      { id: "q8", type: "radio" },
      { id: "q9", type: "radio" },
      { id: "q10", type: "radio" },
    ],
  },
  {
    key: "D",
    questions: [
      { id: "q11", type: "radio" },
      { id: "q12", type: "radio" },
      { id: "q13", type: "radio" },
    ],
  },
  {
    key: "E",
    questions: [
      { id: "q14", type: "radio" },
      { id: "q15", type: "radio" },
    ],
  },
  {
    key: "F",
    questions: [
      { id: "q16", type: "radio" },
      { id: "q17", type: "radio" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function RiskAssessmentWizardPage() {
  const { t } = useTranslation("riskAssessments");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const prelinkedSystemId = searchParams.get("ai_system_id") ?? "";

  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(0);

  const { data: aiSystems = [] } = useAiSystems();
  const { data: existingAssessment, isLoading: isLoadingAssessment } =
    useRiskAssessment(isEditMode ? id : undefined);
  const createMutation = useCreateRiskAssessment();
  const updateMutation = useUpdateRiskAssessment();

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ai_system_id: prelinkedSystemId,
      q1: "",
      q2: "",
      q3: "",
      q4: [],
      q5: "",
      q6: [],
      q7: "",
      q8: "",
      q9: "",
      q10: "",
      q11: "",
      q12: "",
      q13: "",
      q14: "",
      q15: "",
      q16: "",
      q17: "",
    },
  });

  // Populate form when editing an existing assessment
  useEffect(() => {
    if (!existingAssessment) return;
    const answers = (existingAssessment.answers ?? {}) as Record<
      string,
      string | string[]
    >;
    reset({
      ai_system_id: existingAssessment.ai_system_id,
      q1: (answers.q1 as string) ?? "",
      q2: (answers.q2 as string) ?? "",
      q3: (answers.q3 as string) ?? "",
      q4: (answers.q4 as string[]) ?? [],
      q5: (answers.q5 as string) ?? "",
      q6: (answers.q6 as string[]) ?? [],
      q7: (answers.q7 as string) ?? "",
      q8: (answers.q8 as string) ?? "",
      q9: (answers.q9 as string) ?? "",
      q10: (answers.q10 as string) ?? "",
      q11: (answers.q11 as string) ?? "",
      q12: (answers.q12 as string) ?? "",
      q13: (answers.q13 as string) ?? "",
      q14: (answers.q14 as string) ?? "",
      q15: (answers.q15 as string) ?? "",
      q16: (answers.q16 as string) ?? "",
      q17: (answers.q17 as string) ?? "",
    });
  }, [existingAssessment, reset]);

  const allValues = watch();

  // Live score computation
  const { score, level, isProhibited } = useMemo(() => {
    const answers: Record<string, string | string[]> = {};
    for (let i = 1; i <= 17; i++) {
      const key = `q${i}` as keyof FormValues;
      answers[key] = allValues[key] as string | string[];
    }
    return calculateAssessmentScore(answers);
  }, [allValues]);

  // Wizard step definitions
  const steps = SECTIONS.map((s) => ({
    id: s.key,
    label: t(`wizard.step${s.key}`),
  }));

  // Build payload from form values
  function buildPayload(values: FormValues, status: string) {
    const answers: Record<string, string | string[]> = {};
    for (let i = 1; i <= 17; i++) {
      const key = `q${i}` as keyof FormValues;
      answers[key] = values[key] as string | string[];
    }
    const computed = calculateAssessmentScore(answers);

    const requirementKey = computed.level as
      | "minimal"
      | "limited"
      | "high"
      | "critical"
      | "prohibited";
    const requirementsArr = t(`requirements.${requirementKey}`, {
      returnObjects: true,
    }) as string[];

    return {
      ai_system_id: values.ai_system_id,
      total_score: computed.score,
      risk_level: computed.level,
      answers: answers as any,
      requirements: requirementsArr as any,
      status,
    };
  }

  // Submit (create or update)
  async function onSubmit(values: FormValues) {
    const payload = buildPayload(values, "submitted");
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast.success(t("toast.updated"));
      } else {
        const result = await createMutation.mutateAsync(payload);
        toast.success(t("toast.created"));
        navigate(`/risks/${result.id}`);
        return;
      }
      navigate(`/risks/${id}`);
    } catch {
      toast.error(
        t("toast.error", { defaultValue: "Une erreur est survenue" }),
      );
    }
  }

  async function onSaveDraft() {
    const values = allValues;
    const payload = buildPayload(values, "draft");
    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast.success(t("toast.updated"));
        navigate(`/risks/${id}`);
      } else {
        const result = await createMutation.mutateAsync(payload);
        toast.success(t("toast.created"));
        navigate(`/risks/${result.id}`);
      }
    } catch {
      toast.error(
        t("toast.error", { defaultValue: "Une erreur est survenue" }),
      );
    }
  }

  // Requirements for the current level (shown on the last step)
  const requirementsList = t(`requirements.${level}`, {
    returnObjects: true,
  }) as string[];

  /* ---------------------------------------------------------------- */
  /*  LOADING (edit mode)                                               */
  /* ---------------------------------------------------------------- */

  if (isEditMode && isLoadingAssessment) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                            */
  /* ---------------------------------------------------------------- */

  const section = SECTIONS[currentStep];
  const pageTitle = isEditMode ? t("wizard.editTitle") : t("title");
  const submitLabel = isEditMode
    ? t("wizard.updateSubmit")
    : t("wizard.submit");
  const draftLabel = isEditMode
    ? t("wizard.updateDraft")
    : t("wizard.saveDraft");

  return (
    <PortalPage
      icon={ShieldAlert}
      title={pageTitle}
      description={t("description")}
      helpNs="riskAssessments"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left -- wizard form */}
        <div>
          <FormWizard
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit(onSubmit)}
            onSaveDraft={onSaveDraft}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            draftLabel={draftLabel}
          >
            <div className="space-y-8">
              {/* AI System selector (shown on first step only) */}
              {currentStep === 0 && (
                <div className="space-y-2">
                  <Label>{t("columns.system")}</Label>
                  <Controller
                    control={control}
                    name="ai_system_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("columns.system")} />
                        </SelectTrigger>
                        <SelectContent>
                          {aiSystems.map((sys) => (
                            <SelectItem key={sys.id} value={sys.id}>
                              {sys.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {/* Questions for the current section */}
              {section.questions.map((qDef) => (
                <QuestionField
                  key={qDef.id}
                  control={control}
                  questionId={qDef.id}
                  type={qDef.type}
                  t={t}
                />
              ))}

              {/* On last step: requirements checklist */}
              {currentStep === SECTIONS.length - 1 && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("result.requirements")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusBadge
                      status={level}
                      label={t(`riskLevels.${level}`)}
                    />
                    <ul className="mt-4 space-y-2">
                      {requirementsList.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </FormWizard>
        </div>

        {/* Right -- live score sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <RiskScoreGauge score={score} size="lg" showLabel />
              <p className="text-sm text-muted-foreground">
                {t("result.score")}
              </p>
            </CardContent>
          </Card>

          {/* Prohibited warning */}
          {isProhibited && (
            <div className="flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div className="text-sm">
                <p className="font-semibold text-red-800">
                  {t("riskLevels.prohibited")}
                </p>
                <p className="mt-1 text-red-700">
                  {(
                    t("requirements.prohibited", {
                      returnObjects: true,
                    }) as string[]
                  )[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
}

/* ------------------------------------------------------------------ */
/*  QUESTION FIELD COMPONENT                                            */
/* ------------------------------------------------------------------ */

function QuestionField({
  control,
  questionId,
  type,
  t,
}: {
  control: any;
  questionId: keyof FormValues;
  type: "radio" | "checkbox";
  t: (key: string, opts?: any) => any;
}) {
  const questionText = t(`questions.${questionId}.question`);
  const options = t(`questions.${questionId}.options`, {
    returnObjects: true,
  }) as Record<string, string>;

  if (type === "radio") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">{questionText}</p>
        <Controller
          control={control}
          name={questionId}
          render={({ field }) => (
            <RadioGroup
              value={field.value as string}
              onValueChange={field.onChange}
            >
              {Object.entries(options).map(([value, label]) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={value}
                    id={`${questionId}-${value}`}
                  />
                  <Label
                    htmlFor={`${questionId}-${value}`}
                    className="font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </div>
    );
  }

  // Checkbox (multi-select)
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{questionText}</p>
      <Controller
        control={control}
        name={questionId}
        render={({ field }) => {
          const selected = (field.value ?? []) as string[];
          return (
            <div className="grid gap-2">
              {Object.entries(options).map(([value, label]) => {
                const isChecked = selected.includes(value);
                return (
                  <div key={value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${questionId}-${value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...selected, value]);
                        } else {
                          field.onChange(
                            selected.filter((v: string) => v !== value),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${questionId}-${value}`}
                      className="font-normal"
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
