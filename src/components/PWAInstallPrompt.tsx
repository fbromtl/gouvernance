import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const { canShow, install, dismiss } = usePWAInstall();
  const { t } = useTranslation("portail");

  if (!canShow) return null;

  return (
    <div className="flex items-center gap-3 bg-brand-forest px-4 py-2 text-white text-sm shrink-0">
      <Download className="h-4 w-4 shrink-0" />
      <span className="flex-1">{t("installPrompt.message")}</span>
      <Button
        size="sm"
        variant="secondary"
        className="h-7 px-3 text-xs font-semibold bg-white text-brand-forest hover:bg-white/90"
        onClick={install}
      >
        {t("installPrompt.install")}
      </Button>
      <button
        onClick={dismiss}
        className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
