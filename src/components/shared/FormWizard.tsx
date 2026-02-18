import type { ReactNode, ComponentType } from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WizardStep {
  id: string;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
}

interface FormWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: ReactNode;
  onSubmit?: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  canGoNext?: boolean;
  submitLabel?: string;
  draftLabel?: string;
}

export function FormWizard({
  steps,
  currentStep,
  onStepChange,
  children,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  canGoNext = true,
  submitLabel = "Soumettre",
  draftLabel = "Sauvegarder brouillon",
}: FormWizardProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onSubmit?.();
    } else {
      onStepChange(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }

  function handleStepClick(index: number) {
    // Only allow clicking on completed (past) steps
    if (index < currentStep) {
      onStepChange(index);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Horizontal stepper ---- */}
      <nav aria-label="Étapes du formulaire" className="w-full">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isFuture = index > currentStep;
            const StepIcon = step.icon;

            return (
              <li
                key={step.id}
                className={cn("flex items-center", index < steps.length - 1 && "flex-1")}
              >
                {/* Step circle + label group */}
                <button
                  type="button"
                  className={cn(
                    "group flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2",
                    isCompleted && "cursor-pointer",
                    isFuture && "cursor-default",
                    isCurrent && "cursor-default",
                  )}
                  onClick={() => handleStepClick(index)}
                  disabled={!isCompleted}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {/* Circle / checkmark */}
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      isCompleted && "bg-green-100 text-green-600",
                      isCurrent && "bg-primary text-primary-foreground",
                      isFuture && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-5" />
                    ) : StepIcon ? (
                      <StepIcon className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </span>

                  {/* Label + description — hidden on mobile except for current step */}
                  <span
                    className={cn(
                      "flex flex-col text-left leading-tight",
                      isCurrent ? "flex" : "hidden sm:flex",
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium sm:text-sm",
                        isCompleted && "text-green-700",
                        isCurrent && "text-foreground",
                        isFuture && "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {step.description && (
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {step.description}
                      </span>
                    )}
                  </span>
                </button>

                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-px flex-1 sm:mx-3",
                      index < currentStep ? "bg-green-400" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ---- Step content ---- */}
      <div className="min-h-0 flex-1">{children}</div>

      {/* ---- Bottom navigation buttons ---- */}
      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Previous */}
        <div>
          {!isFirstStep && (
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Pr&eacute;c&eacute;dent
            </Button>
          )}
        </div>

        {/* Right side: Draft + Next/Submit */}
        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
            >
              {draftLabel}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext || isSubmitting}
          >
            {isSubmitting
              ? "Envoi en cours\u2026"
              : isLastStep
                ? submitLabel
                : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
