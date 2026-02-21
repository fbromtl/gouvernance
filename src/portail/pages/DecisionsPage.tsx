import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  Send,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useDecisions,
  useCreateDecision,
  useUpdateDecision,
  useDeleteDecision,
  useSubmitDecision,
  useApproveDecision,
  useRejectDecision,
} from "@/hooks/useDecisions";
import type { Decision } from "@/types/database";
import { SectionHelpButton } from "@/components/shared/SectionHelpButton";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const DECISION_TYPES = [
  "go_nogo", "substantial_change", "scale_deployment", "vendor_change",
  "policy_adjustment", "ethical_arbitration", "suspension", "exception",
] as const;

const STATUSES = [
  "draft", "submitted", "in_review", "approved", "rejected", "implemented", "archived",
] as const;

const IMPACTS = ["low", "medium", "high", "critical"] as const;

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  in_review: "bg-purple-100 text-purple-800 border-purple-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  implemented: "bg-emerald-100 text-emerald-800 border-emerald-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

const ALL = "__all__";
const NONE = "__none__";

const IMPACT_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const TYPE_COLORS: Record<string, string> = {
  go_nogo: "bg-green-100 text-green-800 border-green-200",
  substantial_change: "bg-orange-100 text-orange-800 border-orange-200",
  scale_deployment: "bg-blue-100 text-blue-800 border-blue-200",
  vendor_change: "bg-purple-100 text-purple-800 border-purple-200",
  policy_adjustment: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ethical_arbitration: "bg-pink-100 text-pink-800 border-pink-200",
  suspension: "bg-red-100 text-red-800 border-red-200",
  exception: "bg-gray-100 text-gray-800 border-gray-200",
};

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function DecisionsPage() {
  const { t } = useTranslation("decisions");
  const { can } = usePermissions();
  const readOnly = !can("approve_decisions");

  const [typeFilter, setTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: decisions = [], isLoading } = useDecisions({
    decision_type: typeFilter === ALL ? undefined : typeFilter,
    status: statusFilter === ALL ? undefined : statusFilter,
    search: searchQuery || undefined,
  });
  const { data: aiSystems = [] } = useAiSystems();
  const { data: members = [] } = useOrgMembers();
  const createDecision = useCreateDecision();
  const updateDecision = useUpdateDecision();
  const deleteDecision = useDeleteDecision();
  const submitDecision = useSubmitDecision();
  const approveDecision = useApproveDecision();
  const rejectDecision = useRejectDecision();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<string>("go_nogo");
  const [formSystemId, setFormSystemId] = useState("");
  const [formContext, setFormContext] = useState("");
  const [formDecisionMade, setFormDecisionMade] = useState("");
  const [formJustification, setFormJustification] = useState("");
  const [formImpact, setFormImpact] = useState(NONE);
  const [formEffectiveDate, setFormEffectiveDate] = useState("");

  const getSystemName = (ids: string[]) => {
    if (!ids || ids.length === 0) return "—";
    const names = ids
      .map((id) => aiSystems.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "—";
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return "—";
    const member = members.find((m) => m.user_id === userId);
    return member?.full_name ?? member?.email ?? "—";
  };

  const openCreateDialog = () => {
    setEditingDecision(null);
    setFormTitle("");
    setFormType("go_nogo");
    setFormSystemId("");
    setFormContext("");
    setFormDecisionMade("");
    setFormJustification("");
    setFormImpact(NONE);
    setFormEffectiveDate("");
    setDialogOpen(true);
  };

  const openEditDialog = (decision: Decision) => {
    setEditingDecision(decision);
    setFormTitle(decision.title);
    setFormType(decision.decision_type);
    setFormSystemId(decision.ai_system_ids?.[0] ?? "");
    setFormContext(decision.context ?? "");
    setFormDecisionMade(decision.decision_made ?? "");
    setFormJustification(decision.justification ?? "");
    setFormImpact(decision.impact ?? NONE);
    setFormEffectiveDate(decision.effective_date ?? "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formTitle.trim() || !formType) return;

    const payload = {
      title: formTitle.trim(),
      decision_type: formType,
      ai_system_ids: formSystemId ? [formSystemId] : [],
      context: formContext.trim() || null,
      decision_made: formDecisionMade.trim() || null,
      justification: formJustification.trim() || null,
      impact: formImpact === NONE ? null : formImpact,
      effective_date: formEffectiveDate || null,
    };

    if (editingDecision) {
      updateDecision.mutate(
        { id: editingDecision.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("messages.updated"));
            setDialogOpen(false);
          },
        }
      );
    } else {
      createDecision.mutate(payload, {
        onSuccess: () => {
          toast.success(t("messages.created"));
          setDialogOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteDecision.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(t("messages.deleted"));
          setDeleteConfirm(null);
        },
      }
    );
  };

  const handleSubmitForApproval = (id: string) => {
    submitDecision.mutate(
      { id },
      { onSuccess: () => toast.success(t("messages.submitted")) }
    );
  };

  const handleApprove = (id: string) => {
    approveDecision.mutate(
      { id },
      { onSuccess: () => toast.success(t("messages.approved")) }
    );
  };

  const handleReject = (id: string) => {
    rejectDecision.mutate(
      { id, rejection_reason: "Rejeté" },
      { onSuccess: () => toast.success(t("messages.rejected")) }
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <SectionHelpButton ns="decisions" />
        </div>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("filters.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allTypes")}</SelectItem>
            {DECISION_TYPES.map((dt) => (
              <SelectItem key={dt} value={dt}>{t(`types.${dt}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("filters.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!readOnly && (
          <Button size="sm" className="ml-auto gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {t("create")}
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">{t("noDecisions")}</p>
          <p className="text-sm text-muted-foreground/70 mt-1">{t("noDecisionsDescription")}</p>
          {!readOnly && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              {t("create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.title")}</TableHead>
                <TableHead className="w-[160px]">{t("table.type")}</TableHead>
                <TableHead className="w-[140px]">{t("table.system")}</TableHead>
                <TableHead className="w-[110px]">{t("table.status")}</TableHead>
                <TableHead className="w-[90px]">{t("table.impact")}</TableHead>
                <TableHead className="w-[100px]">{t("table.date")}</TableHead>
                <TableHead className="w-[120px]">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <button
                      className="text-sm font-medium text-left hover:text-brand-purple transition-colors"
                      onClick={() => setViewingDecision(d)}
                    >
                      {d.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] ${TYPE_COLORS[d.decision_type] ?? ""}`}>
                      {t(`types.${d.decision_type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {getSystemName(d.ai_system_ids)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[d.status] ?? ""}>
                      {t(`statuses.${d.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {d.impact ? (
                      <Badge variant="outline" className={IMPACT_COLORS[d.impact] ?? ""}>
                        {t(`impacts.${d.impact}`)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString("fr-CA")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingDecision(d)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && d.status === "draft" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(d)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={() => handleSubmitForApproval(d.id)}>
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(d.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {!readOnly && (d.status === "submitted" || d.status === "in_review") && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => handleApprove(d.id)}>
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => handleReject(d.id)}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
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
            <DialogTitle>{editingDecision ? t("edit") : t("create")}</DialogTitle>
            <DialogDescription>{t("pageDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{t("form.title")}</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.type")}</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DECISION_TYPES.map((dt) => (
                      <SelectItem key={dt} value={dt}>{t(`types.${dt}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.aiSystems")}</Label>
                <Select value={formSystemId} onValueChange={setFormSystemId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectSystem")} />
                  </SelectTrigger>
                  <SelectContent>
                    {aiSystems.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{t("form.context")}</Label>
              <Textarea value={formContext} onChange={(e) => setFormContext(e.target.value)} rows={3} placeholder={t("form.contextPlaceholder")} />
            </div>

            <div>
              <Label>{t("form.decisionMade")}</Label>
              <Textarea value={formDecisionMade} onChange={(e) => setFormDecisionMade(e.target.value)} rows={2} placeholder={t("form.decisionPlaceholder")} />
            </div>

            <div>
              <Label>{t("form.justification")}</Label>
              <Textarea value={formJustification} onChange={(e) => setFormJustification(e.target.value)} rows={2} placeholder={t("form.justificationPlaceholder")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("form.impact")}</Label>
                <Select value={formImpact} onValueChange={setFormImpact}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectImpact")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t("form.noImpact")}</SelectItem>
                    {IMPACTS.map((i) => (
                      <SelectItem key={i} value={i}>{t(`impacts.${i}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("form.effectiveDate")}</Label>
                <Input type="date" value={formEffectiveDate} onChange={(e) => setFormEffectiveDate(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || createDecision.isPending || updateDecision.isPending}
            >
              {editingDecision ? t("save") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!viewingDecision} onOpenChange={() => setViewingDecision(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {viewingDecision && (
            <>
              <SheetHeader>
                <SheetTitle>{viewingDecision.title}</SheetTitle>
                <SheetDescription>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className={TYPE_COLORS[viewingDecision.decision_type] ?? ""}>
                      {t(`types.${viewingDecision.decision_type}`)}
                    </Badge>
                    <Badge variant="outline" className={STATUS_COLORS[viewingDecision.status] ?? ""}>
                      {t(`statuses.${viewingDecision.status}`)}
                    </Badge>
                    {viewingDecision.impact && (
                      <Badge variant="outline" className={IMPACT_COLORS[viewingDecision.impact] ?? ""}>
                        {t(`impacts.${viewingDecision.impact}`)}
                      </Badge>
                    )}
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {viewingDecision.ai_system_ids?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t("form.aiSystems")}</h4>
                    <p className="text-sm">{getSystemName(viewingDecision.ai_system_ids)}</p>
                  </div>
                )}
                {([
                  ["context", "detail.context"],
                  ["decision_made", "detail.decision"],
                  ["justification", "detail.justification"],
                  ["options_considered", "detail.options"],
                  ["residual_risks", "detail.risks"],
                  ["conditions", "detail.conditions"],
                ] as const).map(([field, labelKey]) => {
                  const value = viewingDecision[field as keyof Decision] as string | null;
                  if (!value) return null;
                  return (
                    <div key={field}>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{t(labelKey)}</h4>
                      <p className="text-sm whitespace-pre-wrap">{value}</p>
                    </div>
                  );
                })}

                {viewingDecision.rejection_reason && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-1">{t("form.rejectionReason")}</h4>
                    <p className="text-sm text-red-700">{viewingDecision.rejection_reason}</p>
                  </div>
                )}

                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>{t("form.requester")}: {getMemberName(viewingDecision.requester_id)}</p>
                  {viewingDecision.effective_date && <p>{t("form.effectiveDate")}: {viewingDecision.effective_date}</p>}
                  <p>Créé le {new Date(viewingDecision.created_at).toLocaleDateString("fr-CA")}</p>
                  {viewingDecision.approved_at && <p>Approuvé le {new Date(viewingDecision.approved_at).toLocaleDateString("fr-CA")}</p>}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteDecision.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
