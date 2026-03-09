import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { DocumentLibrary } from "@/components/resources/DocumentLibrary";
import { PortalPage } from "@/portail/components/PortalPage";

export default function BibliothecPage() {
  const { t } = useTranslation("portail");

  return (
    <PortalPage
      icon={BookOpen}
      title={t("nav.bibliotheque")}
      description={t("bibliothequeDescription")}
    >
      <DocumentLibrary mode="portail" />
    </PortalPage>
  );
}
