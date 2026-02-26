import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Check,
  Key,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateAgent } from "@/hooks/useAgentRegistry";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const AUTONOMY_LEVELS = ["A1", "A2", "A3", "A4", "A5"] as const;
const DECISION_TYPES = ["D1", "D2", "D3", "D4"] as const;
const RISK_LEVELS = ["R1", "R2", "R3", "R4"] as const;

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAgentDialog({
  open,
  onOpenChange,
}: CreateAgentDialogProps) {
  const { t } = useTranslation("agents");
  const createAgent = useCreateAgent();

  // Form state
  const [formAgentId, setFormAgentId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAutonomy, setFormAutonomy] = useState<string>("");
  const [formAllowedTypes, setFormAllowedTypes] = useState<string[]>([]);
  const [formMaxRisk, setFormMaxRisk] = useState<string>("");
  const [formOwnerName, setFormOwnerName] = useState("");
  const [formOwnerEmail, setFormOwnerEmail] = useState("");

  // API key display
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const resetForm = () => {
    setFormAgentId("");
    setFormName("");
    setFormDescription("");
    setFormAutonomy("");
    setFormAllowedTypes([]);
    setFormMaxRisk("");
    setFormOwnerName("");
    setFormOwnerEmail("");
    setGeneratedApiKey(null);
    setApiKeyCopied(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleCreate = () => {
    if (!formAgentId.trim() || !formName.trim() || !formAutonomy) return;

    createAgent.mutate(
      {
        agent_id: formAgentId.trim(),
        name: formName.trim(),
        autonomy_level: formAutonomy,
        allowed_types: formAllowedTypes.length > 0 ? formAllowedTypes : undefined,
        max_risk: formMaxRisk || undefined,
        owner:
          formOwnerName || formOwnerEmail
            ? { name: formOwnerName || undefined, email: formOwnerEmail || undefined }
            : undefined,
        description: formDescription.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          toast.success(t("messages.created"));
          setGeneratedApiKey(data.api_key);
        },
      },
    );
  };

  const handleCopyKey = async () => {
    if (!generatedApiKey) return;
    await navigator.clipboard.writeText(generatedApiKey);
    setApiKeyCopied(true);
    toast.success(t("apiKey.copied"));
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const toggleAllowedType = (dtype: string) => {
    setFormAllowedTypes((prev) =>
      prev.includes(dtype) ? prev.filter((d) => d !== dtype) : [...prev, dtype],
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("create")}</DialogTitle>
          <DialogDescription>{t("pageDescription")}</DialogDescription>
        </DialogHeader>

        {/* Show API key after successful creation */}
        {generatedApiKey ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Key className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                {t("apiKey.generated")}
              </AlertTitle>
              <AlertDescription>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-green-100 px-3 py-2 font-mono text-sm text-green-900 break-all">
                    {generatedApiKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={handleCopyKey}
                  >
                    {apiKeyCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {t("apiKey.copy")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {t("apiKey.warning")}
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>OK</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("form.agent_id")}</Label>
                  <Input
                    value={formAgentId}
                    onChange={(e) => setFormAgentId(e.target.value)}
                    placeholder={t("form.agent_id_placeholder")}
                  />
                </div>
                <div>
                  <Label>{t("form.name")}</Label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t("form.name_placeholder")}
                  />
                </div>
              </div>

              <div>
                <Label>{t("form.description")}</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder={t("form.description_placeholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("form.autonomyLevel")}</Label>
                  <Select value={formAutonomy} onValueChange={setFormAutonomy}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectAutonomy")} />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTONOMY_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {t(`autonomyLevels.${lvl}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("form.maxRisk")}</Label>
                  <Select value={formMaxRisk} onValueChange={setFormMaxRisk}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectRisk")} />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_LEVELS.map((rl) => (
                        <SelectItem key={rl} value={rl}>
                          {t(`riskLevels.${rl}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t("form.allowedTypes")}</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DECISION_TYPES.map((dt) => (
                    <label
                      key={dt}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={formAllowedTypes.includes(dt)}
                        onCheckedChange={() => toggleAllowedType(dt)}
                      />
                      {t(`decisionTypes.${dt}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("form.ownerName")}</Label>
                  <Input
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    placeholder={t("form.ownerName_placeholder")}
                  />
                </div>
                <div>
                  <Label>{t("form.ownerEmail")}</Label>
                  <Input
                    type="email"
                    value={formOwnerEmail}
                    onChange={(e) => setFormOwnerEmail(e.target.value)}
                    placeholder={t("form.ownerEmail_placeholder")}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formAgentId.trim() ||
                  !formName.trim() ||
                  !formAutonomy ||
                  createAgent.isPending
                }
              >
                {t("create")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
