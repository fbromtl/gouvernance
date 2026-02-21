import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { FormWizard } from "@/components/shared/FormWizard";
import { RiskScoreGauge } from "@/components/shared/RiskScoreGauge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useCreateRiskAssessment,
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
  const [searchParams] = useSearchParams();
  const prelinkedSystemId = searchParams.get("ai_system_id") ?? "";

  const [currentStep, setCurrentStep] = useState(0);

  const { data: aiSystems = [] } = useAiSystems();
  const createMutation = useCreateRiskAssessment();

  const {
    control,
    watch,
    handleSubmit,
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

  // Submit
  async function onSubmit(values: FormValues) {
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

    try {
      const result = await createMutation.mutateAsync({
        ai_system_id: values.ai_system_id,
        total_score: computed.score,
        risk_level: computed.level,
        answers: answers as any,
        requirements: requirementsArr as any,
        status: "submitted",
      });
      toast.success(t("toast.created"));
      navigate(`/risks/${result.id}`);
    } catch {
      toast.error("Error");
    }
  }

  async function onSaveDraft() {
    const values = allValues;
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

    try {
      const result = await createMutation.mutateAsync({
        ai_system_id: values.ai_system_id,
        total_score: computed.score,
        risk_level: computed.level,
        answers: answers as any,
        requirements: requirementsArr as any,
        status: "draft",
      });
      toast.success(t("toast.created"));
      navigate(`/risks/${result.id}`);
    } catch {
      toast.error("Error");
    }
  }

  // Requirements for the current level (shown on the last step)
  const requirementsList = t(`requirements.${level}`, {
    returnObjects: true,
  }) as string[];

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                            */
  /* ---------------------------------------------------------------- */

  const section = SECTIONS[currentStep];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} helpNs="riskAssessments" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left — wizard form */}
        <div>
          <FormWizard
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit(onSubmit)}
            onSaveDraft={onSaveDraft}
            isSubmitting={isSubmitting}
            submitLabel={t("wizard.submit")}
            draftLabel={t("wizard.saveDraft")}
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
                    <StatusBadge status={level} label={t(`riskLevels.${level}`)} />
                    <ul className="mt-4 space-y-2">
                      {requirementsList.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
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

        {/* Right — live score sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <RiskScoreGauge score={score} size="lg" showLabel />
              <p className="text-sm text-muted-foreground">{t("result.score")}</p>
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
    </div>
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
                  <RadioGroupItem value={value} id={`${questionId}-${value}`} />
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
