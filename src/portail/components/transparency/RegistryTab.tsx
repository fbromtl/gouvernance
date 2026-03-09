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

import {
  useAutomatedDecisions,
  useCreateAutomatedDecision,
  useUpdateAutomatedDecision,
  useDeleteAutomatedDecision,
} from "@/hooks/useTransparency";
import type { AutomatedDecision } from "@/types/database";
import { QueryState } from "@/portail/components/QueryState";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { DEMO_AUTOMATED_DECISIONS } from "@/portail/demo";
import {
  TRANSPARENCY_IMPACT_COLORS,
  getColorClass,
} from "@/portail/constants/colors";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const AUTOMATION_LEVELS = ["fully_automated", "semi_automated", "assisted"] as const;
const DECISION_IMPACTS = ["high", "medium", "low"] as const;
const LEGAL_BASES = ["consent", "legitimate_interest", "legal_obligation", "contract"] as const;
const REGISTRY_STATUSES = ["active", "suspended", "decommissioned"] as const;

/* ------------------------------------------------------------------ */
/*  FORM TYPES                                                         */
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

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function RegistryTab({
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
  const { data: realEntries = [], isLoading: realLoading, error: realError } = useAutomatedDecisions({ search: search || undefined });
  const entries = isPreview ? DEMO_AUTOMATED_DECISIONS : realEntries;
  const isLoading = isPreview ? false : realLoading;
  const effectiveError = isPreview ? null : realError;
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
      toast.error(t("messages.error", { defaultValue: "Une erreur est survenue" }));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync({ id: deleting.id });
      toast.success(t("messages.registryDeleted"));
      setDeleting(null);
    } catch {
      toast.error(t("messages.error", { defaultValue: "Une erreur est survenue" }));
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

      <QueryState
        isLoading={isLoading}
        error={effectiveError}
        isEmpty={entries.length === 0}
        emptyIcon={Eye}
        emptyTitle={t("registry.noEntries")}
        emptyDescription={t("registry.noEntriesDescription")}
      >
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
                  <TableCell><Badge className={getColorClass(TRANSPARENCY_IMPACT_COLORS, e.decision_impact)}>{t(`decisionImpacts.${e.decision_impact}`)}</Badge></TableCell>
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
      </QueryState>

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
                    <SelectItem value="__none__">{"\u2014"}</SelectItem>
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
