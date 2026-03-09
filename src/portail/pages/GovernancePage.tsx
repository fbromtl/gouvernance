import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Users,
  Building2,
  Sparkles,
  Shield,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { useFeaturePreview } from "@/hooks/useFeaturePreview";

import { PortalPage } from "@/portail/components/PortalPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { PoliciesTab } from "@/portail/components/governance/PoliciesTab";
import { RolesTab } from "@/portail/components/governance/RolesTab";
import { CommitteesTab } from "@/portail/components/governance/CommitteesTab";

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function GovernancePage() {
  const { t } = useTranslation("governance");
  const { can } = usePermissions();
  const { isPreview } = useFeaturePreview("governance_structure");

  const readOnly = !can("manage_policies");

  return (
    <PortalPage
      icon={Shield}
      title={t("pageTitle")}
      description={t("pageDescription")}
      helpNs="governance"
      feature="governance_structure"
      actions={
        <Button asChild className="gap-2 shrink-0">
          <Link to="/modeles">
            <Sparkles className="h-4 w-4" />
            {t("generatePolicy")}
          </Link>
        </Button>
      }
    >
      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("tabs.policies")}
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Users className="h-4 w-4" />
            {t("tabs.roles")}
          </TabsTrigger>
          <TabsTrigger value="committees" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t("tabs.committees")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <PoliciesTab readOnly={readOnly} isPreview={isPreview} />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab readOnly={readOnly} isPreview={isPreview} />
        </TabsContent>
        <TabsContent value="committees">
          <CommitteesTab readOnly={readOnly} isPreview={isPreview} />
        </TabsContent>
      </Tabs>
    </PortalPage>
  );
}
