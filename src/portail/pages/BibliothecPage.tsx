import { useTranslation } from "react-i18next";
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";

export default function BibliothecPage() {
  const { t } = useTranslation("portail");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("nav.bibliotheque")}
        </h1>
        <p className="text-muted-foreground">
          {t("bibliothequeDescription")}
        </p>
      </div>

      <DocumentLibrary mode="portail" />
    </div>
  );
}
