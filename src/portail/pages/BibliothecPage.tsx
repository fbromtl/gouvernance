import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";
import { PageHeader } from "@/components/shared/PageHeader";

export default function BibliothecPage() {
  const { t } = useTranslation("portail");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={BookOpen}
        title={t("nav.bibliotheque")}
        description={t("bibliothequeDescription")}
      />

      <DocumentLibrary mode="portail" />
    </div>
  );
}
