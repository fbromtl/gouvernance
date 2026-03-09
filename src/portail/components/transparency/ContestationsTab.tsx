import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Plus,
  Pencil,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  useContestations,
  useCreateContestation,
  useUpdateContestation,
} from "@/hooks/useTransparency";
import type { Contestation } from "@/types/database";
import { QueryState } from "@/portail/components/QueryState";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DEMO_CONTESTATIONS } from "@/portail/demo";
import {
  CONTESTATION_STATUS_COLORS,
  getColorClass,
} from "@/portail/constants/colors";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const RECEPTION_CHANNELS = ["email", "web_form", "mail", "phone", "in_person"] as const;
const CONTESTATION_STATUSES = [
  "received", "assigned", "under_review", "decision_revised",
  "decision_maintained", "notified", "closed",
] as const;

/* ------------------------------------------------------------------ */
/*  FORM TYPES                                                         */
/* ------------------------------------------------------------------ */

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

export function ContestationsTab({
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
  const { data: realContestations = [], isLoading: realLoading, error: realError } = useContestations({
    status: filterStatus !== "__all__" ? filterStatus : undefined,
    search: search || undefined,
  });
  const contestations = isPreview ? DEMO_CONTESTATIONS : realContestations;
  const isLoading = isPreview ? false : realLoading;
  const effectiveError = isPreview ? null : realError;
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
      toast.error(t("messages.error", { defaultValue: "Une erreur est survenue" }));
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

      <QueryState
        isLoading={isLoading}
        error={effectiveError}
        isEmpty={contestations.length === 0}
        emptyIcon={Eye}
        emptyTitle={t("contestation.noContestations")}
        emptyDescription={t("contestation.noContestationsDescription")}
      >
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
                  <TableCell className="text-sm">{c.received_at ? new Date(c.received_at).toLocaleDateString() : "\u2014"}</TableCell>
                  <TableCell><Badge className={getColorClass(CONTESTATION_STATUS_COLORS, c.status)}>{t(`contestationStatuses.${c.status}`)}</Badge></TableCell>
                  <TableCell>{c.review_outcome ? <Badge variant="outline">{t(`reviewOutcomes.${c.review_outcome}`)}</Badge> : "\u2014"}</TableCell>
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
      </QueryState>

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
                        <SelectItem value="__none__">{"\u2014"}</SelectItem>
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
                <div><span className="font-medium">{t("contestationTable.receivedAt")}:</span> {viewing.received_at ? new Date(viewing.received_at).toLocaleDateString() : "\u2014"}</div>
                <div><span className="font-medium">{t("contestationTable.status")}:</span> <Badge className={getColorClass(CONTESTATION_STATUS_COLORS, viewing.status)}>{t(`contestationStatuses.${viewing.status}`)}</Badge></div>
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
