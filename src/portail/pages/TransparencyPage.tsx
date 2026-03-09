import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import { useFeaturePreview } from "@/hooks/useFeaturePreview";

import { PortalPage } from "@/portail/components/PortalPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { RegistryTab } from "@/portail/components/transparency/RegistryTab";
import { ContestationsTab } from "@/portail/components/transparency/ContestationsTab";

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function TransparencyPage() {
  const { t } = useTranslation("transparency");
  const { can } = usePermissions();
  const readOnly = !can("manage_compliance");
  const { isPreview } = useFeaturePreview("transparency");

  const { data: systems = [] } = useAiSystems();
  const getSystemName = (id: string) => systems.find((s) => s.id === id)?.name ?? "\u2014";

  return (
    <PortalPage
      icon={Eye}
      title={t("pageTitle")}
      description={t("pageDescription")}
      helpNs="transparency"
      feature="transparency"
    >
      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">{t("tabs.registry")}</TabsTrigger>
          <TabsTrigger value="contestations">{t("tabs.contestations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="mt-4">
          <RegistryTab readOnly={readOnly} systems={systems} getSystemName={getSystemName} isPreview={isPreview} />
        </TabsContent>

        <TabsContent value="contestations" className="mt-4">
          <ContestationsTab readOnly={readOnly} systems={systems} getSystemName={getSystemName} isPreview={isPreview} />
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
