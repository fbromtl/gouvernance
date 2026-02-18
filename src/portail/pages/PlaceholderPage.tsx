import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const moduleNames: Record<string, string> = {
  "ai-systems": "nav.aiSystems",
  governance: "nav.governance",
  risks: "nav.risks",
  decisions: "nav.decisions",
  bias: "nav.bias",
  incidents: "nav.incidents",
  transparency: "nav.transparency",
  lifecycle: "nav.lifecycle",
  documents: "nav.documents",
  monitoring: "nav.monitoring",
  data: "nav.data",
  vendors: "nav.vendors",
  compliance: "nav.compliance",
  admin: "nav.admin",
};

export default function PlaceholderPage() {
  const { t } = useTranslation("portail");
  const location = useLocation();

  const segment = location.pathname.split("/").filter(Boolean).pop() ?? "";
  const moduleName = moduleNames[segment] ? t(moduleNames[segment]) : segment;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-brand-purple/10 flex items-center justify-center">
            <Construction className="h-8 w-8 text-brand-purple" />
          </div>
          <h2 className="text-xl font-semibold">{moduleName}</h2>
          <p className="text-muted-foreground text-sm">
            {t("placeholder.description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
