import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollText, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  CGU SECTION KEYS                                                    */
/* ------------------------------------------------------------------ */

const sectionKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function ConditionsPage() {
  const { acceptCgu } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("conditions");
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!checked) return;
    setSubmitting(true);
    try {
      await acceptCgu();
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-dark to-[#1e1a30] p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <ScrollText className="size-5" />
              </div>
              <span className="text-sm font-medium text-white/70">
                {t("lastStep")}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <p className="mt-2 text-white/70">
              {t("description")}
            </p>
          </div>

          {/* CGU Content */}
          <div className="max-h-[350px] overflow-y-auto p-6 sm:p-8 space-y-5 text-sm leading-relaxed text-muted-foreground">
            {sectionKeys.map((key) => (
              <div key={key}>
                <h3 className="font-semibold text-foreground mb-1">
                  {t(`sections.${key}.title`)}
                </h3>
                <p>{t(`sections.${key}.content`)}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-6 sm:p-8 space-y-4">
            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="flex size-5 items-center justify-center rounded-md border-2 border-border peer-checked:border-brand-purple peer-checked:bg-brand-purple transition-colors">
                  {checked && <CheckCircle2 className="size-4 text-white" />}
                </div>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {t("checkboxLabel")}
              </span>
            </label>

            {/* Submit */}
            <Button
              onClick={handleAccept}
              disabled={!checked || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? t("submitting") : t("submitButton")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
