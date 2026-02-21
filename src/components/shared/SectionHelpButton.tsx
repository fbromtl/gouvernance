import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Lightbulb, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SectionHelpButtonProps {
  /** i18n namespace where `help.title`, `help.why`, `help.how` keys live */
  ns: string;
  /** Optional size variant */
  size?: "sm" | "md";
}

/**
 * Contextual help icon that opens a dialog explaining
 * why the current section exists and how to use it.
 */
export function SectionHelpButton({ ns, size = "sm" }: SectionHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(ns);
  const { t: tc } = useTranslation("common");

  const title = t("help.title", { defaultValue: "" });
  const why = t("help.why", { defaultValue: "" });
  const how = t("help.how", { defaultValue: "" });

  // Don't render if no help content is available
  if (!title && !why && !how) return null;

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full text-muted-foreground/60 hover:text-brand-purple hover:bg-brand-purple/10 transition-colors duration-200 p-1 -ml-0.5"
        aria-label={tc("help.openHelp", { defaultValue: "Comprendre cette section" })}
        title={tc("help.openHelp", { defaultValue: "Comprendre cette section" })}
      >
        <HelpCircle className={iconSize} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10">
                <HelpCircle className="h-4 w-4 text-brand-purple" />
              </div>
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {why && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-brand-purple" />
                  {tc("help.whyTitle", { defaultValue: "Pourquoi cette section ?" })}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                  {why}
                </p>
              </div>
            )}

            {how && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {tc("help.howTitle", { defaultValue: "Comment l'utiliser ?" })}
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed pl-6 space-y-1">
                  {how.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
              {tc("help.understood", { defaultValue: "Compris" })} ✓
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
