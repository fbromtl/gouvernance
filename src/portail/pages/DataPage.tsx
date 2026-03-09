import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Database } from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { useFeaturePreview } from "@/hooks/useFeaturePreview";
import { useAiSystems } from "@/hooks/useAiSystems";
import { useDatasets } from "@/hooks/useData";

import { PortalPage } from "@/portail/components/PortalPage";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DatasetsTab } from "@/portail/components/data/DatasetsTab";
import { TransfersTab } from "@/portail/components/data/TransfersTab";
import { DEMO_DATASETS } from "@/portail/demo";

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function DataPage() {
  const { t } = useTranslation("data");
  const { can } = usePermissions();
  const { isPreview } = useFeaturePreview("data_catalog");
  const readOnly = !can("manage_compliance");

  const [activeTab, setActiveTab] = useState("datasets");

  /* ---- shared data ---- */
  const { data: aiSystems = [] } = useAiSystems();
  const { data: rawDatasets = [], isError: dsError } = useDatasets({});
  const datasets = isPreview ? DEMO_DATASETS : rawDatasets;

  const getSystemName = (ids: string[]) => {
    if (!ids || ids.length === 0) return "\u2014";
    const names = ids
      .map((id) => aiSystems.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "\u2014";
  };

  /* ---- error state ---- */
  if (dsError && !isPreview) {
    return (
      <PortalPage
        icon={Database}
        title={t("pageTitle")}
        description={t("pageDescription")}
        helpNs="data"
        feature="data_catalog"
      >
        <Card className="p-8 text-center">
          <Database className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("errorLoading", { defaultValue: "Erreur de chargement des donn\u00e9es." })}
          </p>
        </Card>
      </PortalPage>
    );
  }

  return (
    <PortalPage
      icon={Database}
      title={t("pageTitle")}
      description={t("pageDescription")}
      helpNs="data"
      feature="data_catalog"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="datasets">{t("tabs.datasets")}</TabsTrigger>
          <TabsTrigger value="transfers">{t("tabs.transfers")}</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-4">
          <DatasetsTab
            readOnly={readOnly}
            isPreview={isPreview}
            aiSystems={aiSystems}
            getSystemName={getSystemName}
          />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          <TransfersTab
            readOnly={readOnly}
            isPreview={isPreview}
            datasets={datasets}
          />
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
