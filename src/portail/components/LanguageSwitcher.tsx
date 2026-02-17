import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { SupportedLanguage } from "@/i18n";

const languages: { code: SupportedLanguage; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center rounded-lg border border-border/50 overflow-hidden text-xs font-medium">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(
            "px-2.5 py-1.5 transition-colors",
            i18n.language === lang.code
              ? "bg-brand-purple text-white"
              : "bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
