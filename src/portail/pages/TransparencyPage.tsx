import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useAutomatedDecisions,
  useCreateAutomatedDecision,
  useUpdateAutomatedDecision,
  useDeleteAutomatedDecision,
  useContestations,
  useCreateContestation,
  useUpdateContestation,
} from "@/hooks/useTransparency";
import type { AutomatedDecision, Contestation } from "@/types/database";
import { SectionHelpButton } from "@/components/shared/SectionHelpButton";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { useFeaturePreview } from "@/hooks/useFeaturePreview";
import { DEMO_AUTOMATED_DECISIONS, DEMO_CONTESTATIONS } from "@/portail/demo";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const AUTOMATION_LEVELS = ["fully_automated", "semi_automated", "assisted"] as const;
const DECISION_IMPACTS = ["high", "medium", "low"] as const;
const LEGAL_BASES = ["consent", "legitimate_interest", "legal_obligation", "contract"] as const;
const REGISTRY_STATUSES = ["active", "suspended", "decommissioned"] as const;
const RECEPTION_CHANNELS = ["email", "web_form", "mail", "phone", "in_person"] as const;
const CONTESTATION_STATUSES = [
  "received", "assigned", "under_review", "decision_revised",
  "decision_maintained", "notified", "closed",
] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function impactColor(s: string) {
  switch (s) {
    case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function contestationStatusColor(s: string) {
  switch (s) {
    case "received": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "assigned": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "under_review": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "decision_revised": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "decision_maintained": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "notified": return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
    case "closed": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

/* ------------------------------------------------------------------ */
/*  EMPTY FORMS                                                        */
/* ------------------------------------------------------------------ */

interface RegistryFormData {
  ai_system_id: string;
  decision_type: string;
  automation_level: string;
  affected_persons: string;
  decision_impact: string;
  information_channel: string;
  explanation_enabled: boolean;
  contestation_enabled: boolean;
  legal_basis: string;
  status: string;
}

const emptyRegistryForm: RegistryFormData = {
  ai_system_id: "",
  decision_type: "",
  automation_level: "",
  affected_persons: "",
  decision_impact: "",
  information_channel: "",
  explanation_enabled: false,
  contestation_enabled: false,
  legal_basis: "",
  status: "active",
};

interface ContestationFormData {
  ai_system_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  received_at: string;
  reception_channel: string;
  contested_decision_description: string;
  contestation_reason: string;
  requester_observations: string;
  analysis: string;
  review_outcome: string;
  justification: string;
  revised_decision: string;
  decision_date: string;
  status: string;
}

const emptyContestationForm: ContestationFormData = {
  ai_system_id: "",
  requester_name: "",
  requester_email: "",
  requester_phone: "",
  received_at: new Date().toISOString().slice(0, 10),
  reception_channel: "",
  contested_decision_description: "",
  contestation_reason: "",
  requester_observations: "",
  analysis: "",
  review_outcome: "",
  justification: "",
  revised_decision: "",
  decision_date: "",
  status: "received",
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function TransparencyPage() {
  const { t } = useTranslation("transparency");
  const { can } = usePermissions();
  const readOnly = !can("manage_compliance");
  const { isPreview } = useFeaturePreview("transparency");

  const { data: systems = [] } = useAiSystems();
  const getSystemName = (id: string) => systems.find((s) => s.id === id)?.name ?? "—";

  return (
    <FeatureGate feature="transparency">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="h-6 w-6 text-brand-purple" />
              {t("pageTitle")}
            </h1>
            <SectionHelpButton ns="transparency" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{t("pageDescription")}</p>
        </div>

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
      </div>
    </FeatureGate>
  );
}

/* ------------------------------------------------------------------ */
/*  REGISTRY TAB                                                       */
/* ------------------------------------------------------------------ */

function RegistryTab({
  readOnly,
  systems,
  getSystemName,
  isPreview,
}: {
  readOnly: boolean;
  systems: { id: string; name: string }[];
  getSystemName: (id: string) => string;
  isPreview: boolean;
}) {
  const { t } = useTranslation("transparency");
  const [search, setSearch] = useState("");
  const { data: realEntries = [], isLoading: realLoading } = useAutomatedDecisions({ search: search || undefined });
  const entries = isPreview ? DEMO_AUTOMATED_DECISIONS : realEntries;
  const isLoading = isPreview ? false : realLoading;
  const createMutation = useCreateAutomatedDecision();
  const updateMutation = useUpdateAutomatedDecision();
  const deleteMutation = useDeleteAutomatedDecision();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AutomatedDecision | null>(null);
  const [form, setForm] = useState<RegistryFormData>(emptyRegistryForm);
  const [deleting, setDeleting] = useState<AutomatedDecision | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyRegistryForm);
    setDialogOpen(true);
  }

  function openEdit(e: AutomatedDecision) {
    setEditing(e);
    setForm({
      ai_system_id: e.ai_system_id,
      decision_type: e.decision_type,
      automation_level: e.automation_level,
      affected_persons: (e.affected_persons ?? []).join(", "),
      decision_impact: e.decision_impact,
      information_channel: e.information_channel ?? "",
      explanation_enabled: e.explanation_enabled,
      contestation_enabled: e.contestation_enabled,
      legal_basis: e.legal_basis ?? "",
      status: e.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.ai_system_id || !form.decision_type || !form.automation_level || !form.decision_impact) return;
    const payload = {
      ai_system_id: form.ai_system_id,
      decision_type: form.decision_type,
      automation_level: form.automation_level,
      affected_persons: form.affected_persons.split(",").map((s) => s.trim()).filter(Boolean),
      decision_impact: form.decision_impact,
      information_channel: form.information_channel || null,
      explanation_enabled: form.explanation_enabled,
      contestation_enabled: form.contestation_enabled,
      legal_basis: form.legal_basis || null,
      status: form.status,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast.success(t("messages.registryUpdated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("messages.registryCreated"));
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync({ id: deleting.id });
      toast.success(t("messages.registryDeleted"));
      setDeleting(null);
    } catch {
      toast.error("Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("registry.title")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        {!readOnly && (
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("registry.create")}</Button>
        )}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">...</Card>
      ) : entries.length === 0 ? (
        <Card className="p-12 text-center">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">{t("registry.noEntries")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("registry.noEntriesDescription")}</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("registryTable.system")}</TableHead>
                <TableHead>{t("registryTable.decisionType")}</TableHead>
                <TableHead>{t("registryTable.automationLevel")}</TableHead>
                <TableHead>{t("registryTable.impact")}</TableHead>
                <TableHead>{t("registryTable.contestation")}</TableHead>
                <TableHead>{t("registryTable.status")}</TableHead>
                <TableHead className="text-right">{t("registryTable.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{getSystemName(e.ai_system_id)}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{e.decision_type}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{t(`automationLevels.${e.automation_level}`)}</Badge></TableCell>
                  <TableCell><Badge className={impactColor(e.decision_impact)}>{t(`decisionImpacts.${e.decision_impact}`)}</Badge></TableCell>
                  <TableCell>{e.contestation_enabled ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}</TableCell>
                  <TableCell><Badge variant="outline">{t(`registryStatuses.${e.status}`)}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!readOnly && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("registry.edit") : t("registry.create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("registryForm.aiSystem")}</Label>
              <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                <SelectTrigger><SelectValue placeholder={t("registryForm.selectSystem")} /></SelectTrigger>
                <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("registryForm.decisionType")}</Label>
              <Input value={form.decision_type} onChange={(e) => setForm({ ...form, decision_type: e.target.value })} placeholder={t("registryForm.decisionTypePlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("registryForm.automationLevel")}</Label>
                <Select value={form.automation_level} onValueChange={(v) => setForm({ ...form, automation_level: v })}>
                  <SelectTrigger><SelectValue placeholder={t("registryForm.selectLevel")} /></SelectTrigger>
                  <SelectContent>{AUTOMATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{t(`automationLevels.${l}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("registryForm.decisionImpact")}</Label>
                <Select value={form.decision_impact} onValueChange={(v) => setForm({ ...form, decision_impact: v })}>
                  <SelectTrigger><SelectValue placeholder={t("registryForm.selectImpact")} /></SelectTrigger>
                  <SelectContent>{DECISION_IMPACTS.map((i) => <SelectItem key={i} value={i}>{t(`decisionImpacts.${i}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("registryForm.affectedPersons")}</Label>
              <Input value={form.affected_persons} onChange={(e) => setForm({ ...form, affected_persons: e.target.value })} placeholder={t("registryForm.affectedPersonsPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("registryForm.informationChannel")}</Label>
              <Input value={form.information_channel} onChange={(e) => setForm({ ...form, information_channel: e.target.value })} placeholder={t("registryForm.informationChannelPlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("registryForm.legalBasis")}</Label>
                <Select value={form.legal_basis || "__none__"} onValueChange={(v) => setForm({ ...form, legal_basis: v === "__none__" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder={t("registryForm.selectBasis")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {LEGAL_BASES.map((b) => <SelectItem key={b} value={b}>{t(`legalBases.${b}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {editing && (
                <div className="space-y-2">
                  <Label>{t("registryForm.status")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{REGISTRY_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`registryStatuses.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.explanation_enabled} onChange={(e) => setForm({ ...form, explanation_enabled: e.target.checked })} className="rounded" />
                {t("registryForm.explanationEnabled")}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.contestation_enabled} onChange={(e) => setForm({ ...form, contestation_enabled: e.target.checked })} className="rounded" />
                {t("registryForm.contestationEnabled")}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel", { ns: "common" })}</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? t("registry.edit") : t("registry.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("registry.delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>{t("cancel", { ns: "common" })}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("registry.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONTESTATIONS TAB                                                  */
/* ------------------------------------------------------------------ */

function ContestationsTab({
  readOnly,
  systems,
  getSystemName,
  isPreview,
}: {
  readOnly: boolean;
  systems: { id: string; name: string }[];
  getSystemName: (id: string) => string;
  isPreview: boolean;
}) {
  const { t } = useTranslation("transparency");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("__all__");
  const { data: realContestations = [], isLoading: realLoading } = useContestations({
    status: filterStatus !== "__all__" ? filterStatus : undefined,
    search: search || undefined,
  });
  const contestations = isPreview ? DEMO_CONTESTATIONS : realContestations;
  const isLoading = isPreview ? false : realLoading;
  const createMutation = useCreateContestation();
  const updateMutation = useUpdateContestation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contestation | null>(null);
  const [form, setForm] = useState<ContestationFormData>(emptyContestationForm);
  const [viewing, setViewing] = useState<Contestation | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyContestationForm);
    setDialogOpen(true);
  }

  function openEdit(c: Contestation) {
    setEditing(c);
    setForm({
      ai_system_id: c.ai_system_id,
      requester_name: c.requester_name,
      requester_email: c.requester_email ?? "",
      requester_phone: c.requester_phone ?? "",
      received_at: c.received_at ?? "",
      reception_channel: c.reception_channel,
      contested_decision_description: c.contested_decision_description,
      contestation_reason: c.contestation_reason,
      requester_observations: c.requester_observations ?? "",
      analysis: c.analysis ?? "",
      review_outcome: c.review_outcome ?? "",
      justification: c.justification ?? "",
      revised_decision: c.revised_decision ?? "",
      decision_date: c.decision_date ?? "",
      status: c.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.ai_system_id || !form.requester_name || !form.reception_channel ||
        !form.contested_decision_description || !form.contestation_reason) return;
    const payload = {
      ai_system_id: form.ai_system_id,
      requester_name: form.requester_name,
      requester_email: form.requester_email || null,
      requester_phone: form.requester_phone || null,
      received_at: form.received_at || new Date().toISOString().slice(0, 10),
      reception_channel: form.reception_channel,
      contested_decision_description: form.contested_decision_description,
      contestation_reason: form.contestation_reason,
      requester_observations: form.requester_observations || null,
      analysis: form.analysis || null,
      review_outcome: form.review_outcome || null,
      justification: form.justification || null,
      revised_decision: form.revised_decision || null,
      decision_date: form.decision_date || null,
      status: form.status,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast.success(t("messages.contestationUpdated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("messages.contestationCreated"));
      }
      setDialogOpen(false);
    } catch {
      toast.error("Error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("contestation.title")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tous / All</SelectItem>
            {CONTESTATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`contestationStatuses.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        {!readOnly && (
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{t("contestation.create")}</Button>
        )}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">...</Card>
      ) : contestations.length === 0 ? (
        <Card className="p-12 text-center">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">{t("contestation.noContestations")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("contestation.noContestationsDescription")}</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("contestationTable.caseNumber")}</TableHead>
                <TableHead>{t("contestationTable.requester")}</TableHead>
                <TableHead>{t("contestationTable.system")}</TableHead>
                <TableHead>{t("contestationTable.receivedAt")}</TableHead>
                <TableHead>{t("contestationTable.status")}</TableHead>
                <TableHead>{t("contestationTable.outcome")}</TableHead>
                <TableHead className="text-right">{t("contestationTable.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contestations.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.case_number}</TableCell>
                  <TableCell className="font-medium">{c.requester_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{getSystemName(c.ai_system_id)}</TableCell>
                  <TableCell className="text-sm">{c.received_at ? new Date(c.received_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell><Badge className={contestationStatusColor(c.status)}>{t(`contestationStatuses.${c.status}`)}</Badge></TableCell>
                  <TableCell>{c.review_outcome ? <Badge variant="outline">{t(`reviewOutcomes.${c.review_outcome}`)}</Badge> : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewing(c)}><Eye className="h-4 w-4" /></Button>
                      {!readOnly && (
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("contestation.edit") : t("contestation.create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("contestationForm.aiSystem")}</Label>
              <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                <SelectTrigger><SelectValue placeholder={t("registryForm.selectSystem")} /></SelectTrigger>
                <SelectContent>{systems.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("contestationForm.requesterName")}</Label>
                <Input value={form.requester_name} onChange={(e) => setForm({ ...form, requester_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("contestationForm.requesterEmail")}</Label>
                <Input type="email" value={form.requester_email} onChange={(e) => setForm({ ...form, requester_email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("contestationForm.receptionChannel")}</Label>
                <Select value={form.reception_channel} onValueChange={(v) => setForm({ ...form, reception_channel: v })}>
                  <SelectTrigger><SelectValue placeholder={t("contestationForm.selectChannel")} /></SelectTrigger>
                  <SelectContent>{RECEPTION_CHANNELS.map((c) => <SelectItem key={c} value={c}>{t(`receptionChannels.${c}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("contestationForm.receivedAt")}</Label>
                <Input type="date" value={form.received_at} onChange={(e) => setForm({ ...form, received_at: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("contestationForm.contestedDecision")}</Label>
              <Textarea value={form.contested_decision_description} onChange={(e) => setForm({ ...form, contested_decision_description: e.target.value })} placeholder={t("contestationForm.contestedDecisionPlaceholder")} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{t("contestationForm.contestationReason")}</Label>
              <Textarea value={form.contestation_reason} onChange={(e) => setForm({ ...form, contestation_reason: e.target.value })} placeholder={t("contestationForm.contestationReasonPlaceholder")} rows={3} />
            </div>

            {/* Review fields (for edit only) */}
            {editing && (
              <>
                <div className="space-y-2">
                  <Label>{t("contestationForm.status")}</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CONTESTATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`contestationStatuses.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("contestationForm.analysis")}</Label>
                  <Textarea value={form.analysis} onChange={(e) => setForm({ ...form, analysis: e.target.value })} placeholder={t("contestationForm.analysisPlaceholder")} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("contestationForm.reviewOutcome")}</Label>
                    <Select value={form.review_outcome || "__none__"} onValueChange={(v) => setForm({ ...form, review_outcome: v === "__none__" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder={t("contestationForm.selectOutcome")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        <SelectItem value="maintained">{t("reviewOutcomes.maintained")}</SelectItem>
                        <SelectItem value="revised">{t("reviewOutcomes.revised")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("contestationForm.decisionDate")}</Label>
                    <Input type="date" value={form.decision_date} onChange={(e) => setForm({ ...form, decision_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("contestationForm.justification")}</Label>
                  <Textarea value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} placeholder={t("contestationForm.justificationPlaceholder")} rows={3} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("cancel", { ns: "common" })}</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? t("contestation.edit") : t("contestation.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!viewing} onOpenChange={() => setViewing(null)}>
        <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.case_number}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div><span className="font-medium">{t("contestationForm.requesterName")}:</span> {viewing.requester_name}</div>
                {viewing.requester_email && <div><span className="font-medium">{t("contestationForm.requesterEmail")}:</span> {viewing.requester_email}</div>}
                <div><span className="font-medium">{t("contestationTable.system")}:</span> {getSystemName(viewing.ai_system_id)}</div>
                <div><span className="font-medium">{t("contestationForm.receptionChannel")}:</span> {t(`receptionChannels.${viewing.reception_channel}`)}</div>
                <div><span className="font-medium">{t("contestationTable.receivedAt")}:</span> {viewing.received_at ? new Date(viewing.received_at).toLocaleDateString() : "—"}</div>
                <div><span className="font-medium">{t("contestationTable.status")}:</span> <Badge className={contestationStatusColor(viewing.status)}>{t(`contestationStatuses.${viewing.status}`)}</Badge></div>
                <div className="pt-2">
                  <span className="font-medium">{t("contestationForm.contestedDecision")}:</span>
                  <p className="mt-1 whitespace-pre-wrap">{viewing.contested_decision_description}</p>
                </div>
                <div>
                  <span className="font-medium">{t("contestationForm.contestationReason")}:</span>
                  <p className="mt-1 whitespace-pre-wrap">{viewing.contestation_reason}</p>
                </div>
                {viewing.analysis && (
                  <div className="pt-2">
                    <span className="font-medium">{t("contestationForm.analysis")}:</span>
                    <p className="mt-1 whitespace-pre-wrap">{viewing.analysis}</p>
                  </div>
                )}
                {viewing.review_outcome && (
                  <div>
                    <span className="font-medium">{t("contestationForm.reviewOutcome")}:</span>
                    <Badge variant="outline" className="ml-2">{t(`reviewOutcomes.${viewing.review_outcome}`)}</Badge>
                  </div>
                )}
                {viewing.justification && (
                  <div>
                    <span className="font-medium">{t("contestationForm.justification")}:</span>
                    <p className="mt-1 whitespace-pre-wrap">{viewing.justification}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
