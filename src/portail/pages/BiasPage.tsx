import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Scale,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useBiasFindings,
  useCreateBiasFinding,
  useUpdateBiasFinding,
  useDeleteBiasFinding,
} from "@/hooks/useBiasFindings";
import type { BiasFinding } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  DialogDescription,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const BIAS_TYPES = [
  "disparate_impact",
  "representation",
  "measurement",
  "historical",
  "aggregation",
  "evaluation",
  "toxicity",
  "hallucination",
  "stereotyping",
  "other",
] as const;

const DETECTION_METHODS = [
  "automated_test",
  "manual_audit",
  "user_complaint",
  "monitoring",
  "external_audit",
  "regulatory_review",
] as const;

const SEVERITIES = ["critical", "high", "medium", "low"] as const;

const STATUSES = [
  "identified",
  "in_remediation",
  "retest_pending",
  "resolved",
  "accepted_risk",
] as const;

const PROTECTED_DIMENSIONS = [
  "gender",
  "age",
  "ethnicity",
  "disability",
  "religion",
  "sexual_orientation",
  "socioeconomic",
  "geographic",
  "language",
  "intersectional",
] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function severityColor(s: string) {
  switch (s) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusColor(s: string) {
  switch (s) {
    case "identified":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "in_remediation":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "retest_pending":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "accepted_risk":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/* ------------------------------------------------------------------ */
/*  EMPTY FORM                                                         */
/* ------------------------------------------------------------------ */

interface BiasFormData {
  title: string;
  ai_system_id: string;
  bias_type: string;
  detection_method: string;
  protected_dimensions: string[];
  affected_groups: string;
  severity: string;
  likelihood: string;
  estimated_impact: string;
  affected_count: string;
  remediation_description: string;
  remediation_target_date: string;
  status: string;
}

const emptyForm: BiasFormData = {
  title: "",
  ai_system_id: "",
  bias_type: "",
  detection_method: "",
  protected_dimensions: [],
  affected_groups: "",
  severity: "",
  likelihood: "",
  estimated_impact: "",
  affected_count: "",
  remediation_description: "",
  remediation_target_date: "",
  status: "identified",
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function BiasPage() {
  const { t } = useTranslation("bias");
  const { can } = usePermissions();
  const readOnly = !can("manage_bias");

  /* --- filters --- */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("__all__");
  const [filterStatus, setFilterStatus] = useState("__all__");
  const [filterSeverity, setFilterSeverity] = useState("__all__");

  /* --- data --- */
  const { data: findings = [], isLoading } = useBiasFindings({
    bias_type: filterType !== "__all__" ? filterType : undefined,
    status: filterStatus !== "__all__" ? filterStatus : undefined,
    severity: filterSeverity !== "__all__" ? filterSeverity : undefined,
    search: search || undefined,
  });
  const { data: systems = [] } = useAiSystems();

  const createMutation = useCreateBiasFinding();
  const updateMutation = useUpdateBiasFinding();
  const deleteMutation = useDeleteBiasFinding();

  /* --- state --- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BiasFinding | null>(null);
  const [form, setForm] = useState<BiasFormData>(emptyForm);
  const [viewing, setViewing] = useState<BiasFinding | null>(null);
  const [deleting, setDeleting] = useState<BiasFinding | null>(null);

  /* --- handlers --- */
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(f: BiasFinding) {
    setEditing(f);
    setForm({
      title: f.title,
      ai_system_id: f.ai_system_id,
      bias_type: f.bias_type,
      detection_method: f.detection_method,
      protected_dimensions: f.protected_dimensions ?? [],
      affected_groups: f.affected_groups ?? "",
      severity: f.severity,
      likelihood: f.likelihood ?? "",
      estimated_impact: f.estimated_impact ?? "",
      affected_count: f.affected_count?.toString() ?? "",
      remediation_description: f.remediation_description ?? "",
      remediation_target_date: f.remediation_target_date ?? "",
      status: f.status,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.ai_system_id || !form.bias_type || !form.detection_method || !form.severity) return;

    const payload = {
      title: form.title,
      ai_system_id: form.ai_system_id,
      bias_type: form.bias_type,
      detection_method: form.detection_method,
      protected_dimensions: form.protected_dimensions,
      affected_groups: form.affected_groups || null,
      severity: form.severity,
      likelihood: form.likelihood || null,
      estimated_impact: form.estimated_impact || null,
      affected_count: form.affected_count ? parseInt(form.affected_count) : null,
      remediation_description: form.remediation_description || null,
      remediation_target_date: form.remediation_target_date || null,
      status: form.status,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...payload });
        toast.success(t("messages.updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("messages.created"));
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
      toast.success(t("messages.deleted"));
      setDeleting(null);
    } catch {
      toast.error("Error");
    }
  }

  function getSystemName(id: string) {
    return systems.find((s) => s.id === id)?.name ?? "—";
  }

  function toggleDimension(dim: string) {
    setForm((prev) => ({
      ...prev,
      protected_dimensions: prev.protected_dimensions.includes(dim)
        ? prev.protected_dimensions.filter((d) => d !== dim)
        : [...prev.protected_dimensions, dim],
    }));
  }

  /* --- render --- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-brand-purple" />
            {t("pageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("pageDescription")}</p>
        </div>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("create")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allTypes")}</SelectItem>
            {BIAS_TYPES.map((bt) => (
              <SelectItem key={bt} value={bt}>{t(`biasTypes.${bt}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.filterBySeverity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allSeverities")}</SelectItem>
            {SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>{t(`severities.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("filters.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">...</Card>
      ) : findings.length === 0 ? (
        <Card className="p-12 text-center">
          <Scale className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg">{t("noFindings")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("noFindingsDescription")}</p>
          {!readOnly && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
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
                <TableHead>{t("table.system")}</TableHead>
                <TableHead>{t("table.biasType")}</TableHead>
                <TableHead>{t("table.severity")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.detectedAt")}</TableHead>
                <TableHead className="text-right">{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{f.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{getSystemName(f.ai_system_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{t(`biasTypes.${f.bias_type}`)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={severityColor(f.severity)}>{t(`severities.${f.severity}`)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(f.status)}>{t(`statuses.${f.status}`)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.detected_at ? new Date(f.detected_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewing(f)} title={t("view")}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(f)} title={t("edit")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(f)} title={t("delete")}>
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("edit") : t("create")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label>{t("form.title")}</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            {/* AI System */}
            <div className="space-y-2">
              <Label>{t("form.aiSystem")}</Label>
              <Select value={form.ai_system_id} onValueChange={(v) => setForm({ ...form, ai_system_id: v })}>
                <SelectTrigger><SelectValue placeholder={t("form.selectSystem")} /></SelectTrigger>
                <SelectContent>
                  {systems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bias Type + Detection Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.biasType")}</Label>
                <Select value={form.bias_type} onValueChange={(v) => setForm({ ...form, bias_type: v })}>
                  <SelectTrigger><SelectValue placeholder={t("form.selectType")} /></SelectTrigger>
                  <SelectContent>
                    {BIAS_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>{t(`biasTypes.${bt}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.detectionMethod")}</Label>
                <Select value={form.detection_method} onValueChange={(v) => setForm({ ...form, detection_method: v })}>
                  <SelectTrigger><SelectValue placeholder={t("form.selectMethod")} /></SelectTrigger>
                  <SelectContent>
                    {DETECTION_METHODS.map((dm) => (
                      <SelectItem key={dm} value={dm}>{t(`detectionMethods.${dm}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Protected Dimensions */}
            <div className="space-y-2">
              <Label>{t("form.protectedDimensions")}</Label>
              <div className="flex flex-wrap gap-2">
                {PROTECTED_DIMENSIONS.map((dim) => (
                  <Badge
                    key={dim}
                    variant={form.protected_dimensions.includes(dim) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDimension(dim)}
                  >
                    {t(`protectedDimensions.${dim}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Affected Groups */}
            <div className="space-y-2">
              <Label>{t("form.affectedGroups")}</Label>
              <Textarea
                value={form.affected_groups}
                onChange={(e) => setForm({ ...form, affected_groups: e.target.value })}
                placeholder={t("form.affectedGroupsPlaceholder")}
                rows={2}
              />
            </div>

            {/* Severity + Likelihood */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.severity")}</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue placeholder={t("form.selectSeverity")} /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>{t(`severities.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.likelihood")}</Label>
                <Select value={form.likelihood} onValueChange={(v) => setForm({ ...form, likelihood: v })}>
                  <SelectTrigger><SelectValue placeholder={t("form.selectLikelihood")} /></SelectTrigger>
                  <SelectContent>
                    {(["certain", "likely", "possible", "unlikely", "rare"] as const).map((l) => (
                      <SelectItem key={l} value={l}>{t(`likelihoods.${l}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimated Impact */}
            <div className="space-y-2">
              <Label>{t("form.estimatedImpact")}</Label>
              <Textarea
                value={form.estimated_impact}
                onChange={(e) => setForm({ ...form, estimated_impact: e.target.value })}
                placeholder={t("form.estimatedImpactPlaceholder")}
                rows={2}
              />
            </div>

            {/* Affected Count */}
            <div className="space-y-2">
              <Label>{t("form.affectedCount")}</Label>
              <Input
                type="number"
                value={form.affected_count}
                onChange={(e) => setForm({ ...form, affected_count: e.target.value })}
              />
            </div>

            {/* Status (for edit only) */}
            {editing && (
              <div className="space-y-2">
                <Label>{t("filters.filterByStatus")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{t(`statuses.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Remediation */}
            <div className="space-y-2">
              <Label>{t("form.remediationDescription")}</Label>
              <Textarea
                value={form.remediation_description}
                onChange={(e) => setForm({ ...form, remediation_description: e.target.value })}
                placeholder={t("form.remediationDescriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("form.remediationTargetDate")}</Label>
              <Input
                type="date"
                value={form.remediation_target_date}
                onChange={(e) => setForm({ ...form, remediation_target_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel", { ns: "common" })}
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? t("edit") : t("create")}
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
                <SheetTitle>{viewing.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Identification */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">{t("detail.identification")}</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="font-medium">{t("form.aiSystem")}</dt><dd>{getSystemName(viewing.ai_system_id)}</dd></div>
                    <div><dt className="font-medium">{t("form.detectionMethod")}</dt><dd>{t(`detectionMethods.${viewing.detection_method}`)}</dd></div>
                    <div><dt className="font-medium">{t("table.detectedAt")}</dt><dd>{viewing.detected_at ? new Date(viewing.detected_at).toLocaleDateString() : "—"}</dd></div>
                  </dl>
                </section>

                {/* Characterization */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">{t("detail.characterization")}</h3>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="font-medium">{t("form.biasType")}</dt><dd><Badge variant="outline">{t(`biasTypes.${viewing.bias_type}`)}</Badge></dd></div>
                    <div>
                      <dt className="font-medium">{t("form.protectedDimensions")}</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {viewing.protected_dimensions?.length > 0
                          ? viewing.protected_dimensions.map((d) => <Badge key={d} variant="secondary" className="text-xs">{t(`protectedDimensions.${d}`)}</Badge>)
                          : <span className="text-muted-foreground">{t("detail.noContent")}</span>
                        }
                      </dd>
                    </div>
                    {viewing.affected_groups && (
                      <div><dt className="font-medium">{t("form.affectedGroups")}</dt><dd>{viewing.affected_groups}</dd></div>
                    )}
                  </dl>
                </section>

                {/* Assessment */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">{t("detail.assessment")}</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-4">
                      <div><dt className="font-medium">{t("form.severity")}</dt><dd><Badge className={severityColor(viewing.severity)}>{t(`severities.${viewing.severity}`)}</Badge></dd></div>
                      <div><dt className="font-medium">{t("table.status")}</dt><dd><Badge className={statusColor(viewing.status)}>{t(`statuses.${viewing.status}`)}</Badge></dd></div>
                    </div>
                    {viewing.likelihood && <div><dt className="font-medium">{t("form.likelihood")}</dt><dd>{t(`likelihoods.${viewing.likelihood}`)}</dd></div>}
                    {viewing.estimated_impact && <div><dt className="font-medium">{t("form.estimatedImpact")}</dt><dd className="whitespace-pre-wrap">{viewing.estimated_impact}</dd></div>}
                    {viewing.affected_count && <div><dt className="font-medium">{t("form.affectedCount")}</dt><dd>{viewing.affected_count.toLocaleString()}</dd></div>}
                  </dl>
                </section>

                {/* Metrics */}
                {(viewing.fairness_metric || viewing.measured_value != null) && (
                  <section>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">{t("detail.metrics")}</h3>
                    <dl className="space-y-2 text-sm">
                      {viewing.fairness_metric && <div><dt className="font-medium">{t("form.fairnessMetric")}</dt><dd>{viewing.fairness_metric}</dd></div>}
                      {viewing.measured_value != null && <div><dt className="font-medium">{t("form.measuredValue")}</dt><dd>{viewing.measured_value}</dd></div>}
                      {viewing.acceptable_threshold != null && <div><dt className="font-medium">{t("form.acceptableThreshold")}</dt><dd>{viewing.acceptable_threshold}</dd></div>}
                    </dl>
                  </section>
                )}

                {/* Remediation */}
                {(viewing.remediation_description || viewing.remediation_target_date) && (
                  <section>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">{t("detail.remediation")}</h3>
                    <dl className="space-y-2 text-sm">
                      {viewing.remediation_description && <div><dt className="font-medium">{t("form.remediationDescription")}</dt><dd className="whitespace-pre-wrap">{viewing.remediation_description}</dd></div>}
                      {viewing.remediation_target_date && <div><dt className="font-medium">{t("form.remediationTargetDate")}</dt><dd>{new Date(viewing.remediation_target_date).toLocaleDateString()}</dd></div>}
                    </dl>
                  </section>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete")}</DialogTitle>
            <DialogDescription>{t("messages.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>{t("cancel", { ns: "common" })}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
