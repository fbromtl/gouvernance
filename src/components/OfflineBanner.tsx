import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useTranslation("portail");

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-xs font-medium text-white shrink-0">
      <WifiOff className="h-3.5 w-3.5" />
      <span>{t("offlineBanner")}</span>
    </div>
  );
}
