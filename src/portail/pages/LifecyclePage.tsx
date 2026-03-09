import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PortalPage } from "@/portail/components/PortalPage";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { usePermissions } from "@/hooks/usePermissions";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useLifecycleEvents,
  useCreateLifecycleEvent,
  useUpdateLifecycleEvent,
  useDeleteLifecycleEvent,
} from "@/hooks/useLifecycleEvents";
import type { LifecycleEvent } from "@/types/database";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const EVENT_TYPES = [
  "model_update",
  "data_change",
  "prompt_change",
  "threshold_change",
  "vendor_change",
  "infra_change",
  "scope_extension",
  "scope_reduction",
  "suspension",
  "resumption",
  "decommission",
  "bugfix",
] as const;

const IMPACTS = ["none", "low", "medium", "high", "critical"] as const;

const COMPONENTS = [
  "model",
  "data",
  "prompt",
  "config",
  "infrastructure",
  "api",
  "ui",
] as const;

/* ------------------------------------------------------------------ */
/*  EMPTY FORM                                                         */
/* ------------------------------------------------------------------ */

interface LifecycleFormData {
  ai_system_id: string;
  event_type: string;
  title: string;
  description: string;
  components_modified: string[];
  previous_version: string;
  new_version: string;
  change_date: string;
  impact: string;
  is_substantial: boolean;
  risk_reassessment_required: boolean;
}

const emptyForm: LifecycleFormData = {
  ai_system_id: "",
  event_type: "",
  title: "",
  description: "",
  components_modified: [],
  previous_version: "",
  new_version: "",
  change_date: new Date().toISOString().slice(0, 16),
  impact: "low",
  is_substantial: false,
  risk_reassessment_required: false,
};

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function LifecyclePage() {
  const { t } = useTranslation("lifecycle");
  const { can } = usePermissions();
  const readOnly = !can("manage_incidents");

  /* --- filters --- */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("__all__");

  /* --- data --- */
  const { data: events = [], isLoading, isError } = useLifecycleEvents({
    event_type: filterType !== "__all__" ? filterType : undefined,
    search: search || undefined,
  });
  const { data: systems = [] } = useAiSystems();

  const createMutation = useCreateLifecycleEvent();
  const updateMutation = useUpdateLifecycleEvent();
  const deleteMutation = useDeleteLifecycleEvent();

  /* --- state --- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LifecycleEvent | null>(null);
  const [form, setForm] = useState<LifecycleFormData>(emptyForm);
  const [viewing, setViewing] = useState<LifecycleEvent | null>(null);
  const [deleting, setDeleting] = useState<LifecycleEvent | null>(null);

  /* --- handlers --- */
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(evt: LifecycleEvent) {
    setEditing(evt);
    setForm({
      ai_system_id: evt.ai_system_id,
      event_type: evt.event_type,
      title: evt.title,
      description: evt.description ?? "",
      components_modified: evt.components_modified ?? [],
      previous_version: evt.previous_version ?? "",
      new_version: evt.new_version ?? "",
      change_date: evt.change_date
        ? new Date(evt.change_date).toISOString().slice(0, 16)
        : "",
      impact: evt.impact,
      is_substantial: evt.is_substantial,
      risk_reassessment_required: evt.risk_reassessment_required,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.ai_system_id || !form.event_type) return;

    const payload = {
      ai_system_id: form.ai_system_id,
      event_type: form.event_type,
      title: form.title,
      description: form.description || null,
      components_modified: form.components_modified,
      previous_version: form.previous_version || null,
      new_version: form.new_version || null,
      change_date: form.change_date || new Date().toISOString(),
      impact: form.impact,
      is_substantial: form.is_substantial,
      risk_reassessment_required: form.risk_reassessment_required,
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
      toast.error(t("messages.error"));
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync({ id: deleting.id });
      toast.success(t("messages.deleted"));
      setDeleting(null);
    } catch {
      toast.error(t("messages.error"));
    }
  }

  function getSystemName(id: string) {
    return systems.find((s) => s.id === id)?.name ?? "---";
  }

  function toggleComponent(comp: string) {
    setForm((prev) => ({
      ...prev,
      components_modified: prev.components_modified.includes(comp)
        ? prev.components_modified.filter((c) => c !== comp)
        : [...prev.components_modified, comp],
    }));
  }

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "---";
    return new Date(dateStr).toLocaleDateString("fr-CA");
  }

  /* --- Loading skeleton --- */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1 max-w-sm" />
          <Skeleton className="h-9 w-[200px]" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  /* --- Error state --- */
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="size-10 text-destructive mb-4" />
        <p className="text-muted-foreground">{t("errorLoading")}</p>
      </div>
    );
  }

  /* --- Empty state logic --- */
  const isEmpty = events.length === 0;
  const hasActiveFilters = search || filterType !== "__all__";

  return (
    <PortalPage
      title={t("pageTitle")}
      description={t("pageDescription")}
      icon={RefreshCw}
      helpNs="lifecycle"
      actions={
        !readOnly ? (
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            {t("create")}
          </Button>
        ) : undefined
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filters.filterByType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allTypes")}</SelectItem>
            {EVENT_TYPES.map((et) => (
              <SelectItem key={et} value={et}>
                {t(`eventTypes.${et}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {isEmpty ? (
        <EmptyState
          icon={RefreshCw}
          title={hasActiveFilters ? t("emptyFiltered.title") : t("noEvents")}
          description={
            hasActiveFilters
              ? t("emptyFiltered.description")
              : t("noEventsDescription")
          }
          actionLabel={hasActiveFilters || readOnly ? undefined : t("create")}
          onAction={hasActiveFilters || readOnly ? undefined : openCreate}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.title")}</TableHead>
                <TableHead>{t("table.system")}</TableHead>
                <TableHead>{t("table.eventType")}</TableHead>
                <TableHead>{t("table.impact")}</TableHead>
                <TableHead>{t("table.substantial")}</TableHead>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead className="text-right">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt) => (
                <TableRow key={evt.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {evt.title}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getSystemName(evt.ai_system_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {t(`eventTypes.${evt.event_type}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={evt.impact}
                      label={t(`impacts.${evt.impact}`)}
                    />
                  </TableCell>
                  <TableCell>
                    {evt.is_substantial ? (
                      <CheckCircle className="size-4 text-orange-500" />
                    ) : (
                      <XCircle className="size-4 text-muted-foreground/40" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(evt.change_date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewing(evt)}
                        title={t("view")}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {!readOnly && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(evt)}
                            title={t("edit")}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(evt)}
                            title={t("delete")}
                          >
                            <Trash2 className="size-4 text-destructive" />
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
            <DialogTitle>
              {editing ? t("editTitle") : t("createTitle")}
            </DialogTitle>
            <DialogDescription>
              {editing ? t("editDescription") : t("createDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* AI System */}
            <div className="space-y-2">
              <Label>{t("form.aiSystem")} *</Label>
              <Select
                value={form.ai_system_id}
                onValueChange={(v) => setForm({ ...form, ai_system_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectSystem")} />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type + Impact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.eventType")} *</Label>
                <Select
                  value={form.event_type}
                  onValueChange={(v) => setForm({ ...form, event_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((et) => (
                      <SelectItem key={et} value={et}>
                        {t(`eventTypes.${et}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("form.impact")}</Label>
                <Select
                  value={form.impact}
                  onValueChange={(v) => setForm({ ...form, impact: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectImpact")} />
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACTS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {t(`impacts.${i}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>{t("form.title")} *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("form.description")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder={t("form.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            {/* Components Modified */}
            <div className="space-y-2">
              <Label>{t("form.componentsModified")}</Label>
              <div className="flex flex-wrap gap-2">
                {COMPONENTS.map((comp) => (
                  <Badge
                    key={comp}
                    variant={
                      form.components_modified.includes(comp)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleComponent(comp)}
                  >
                    {t(`components.${comp}`)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Previous / New Version */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("form.previousVersion")}</Label>
                <Input
                  value={form.previous_version}
                  onChange={(e) =>
                    setForm({ ...form, previous_version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t("form.newVersion")}</Label>
                <Input
                  value={form.new_version}
                  onChange={(e) =>
                    setForm({ ...form, new_version: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Change Date */}
            <div className="space-y-2">
              <Label>{t("form.changeDate")}</Label>
              <Input
                type="datetime-local"
                value={form.change_date}
                onChange={(e) =>
                  setForm({ ...form, change_date: e.target.value })
                }
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.is_substantial}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_substantial: !!checked })
                  }
                />
                <span className="text-sm font-medium">
                  {t("form.isSubstantial")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.risk_reassessment_required}
                  onCheckedChange={(checked) =>
                    setForm({
                      ...form,
                      risk_reassessment_required: !!checked,
                    })
                  }
                />
                <span className="text-sm font-medium">
                  {t("form.riskReassessment")}
                </span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {editing ? t("save") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!viewing} onOpenChange={() => setViewing(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {viewing && (
            <>
              <SheetHeader>
                <SheetTitle>{viewing.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* General */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                    {t("form.aiSystem")}
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("table.system")}</dt>
                      <dd className="font-medium">{getSystemName(viewing.ai_system_id)}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">{t("table.eventType")}</dt>
                      <dd>
                        <Badge variant="outline">
                          {t(`eventTypes.${viewing.event_type}`)}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("table.date")}</dt>
                      <dd>{formatDate(viewing.change_date)}</dd>
                    </div>
                  </dl>
                </section>

                {/* Description */}
                {viewing.description && (
                  <section>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                      {t("form.description")}
                    </h3>
                    <p className="text-sm whitespace-pre-wrap">
                      {viewing.description}
                    </p>
                  </section>
                )}

                {/* Components */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    {t("form.componentsModified")}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {viewing.components_modified?.length > 0 ? (
                      viewing.components_modified.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {t(`components.${c}`)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">---</span>
                    )}
                  </div>
                </section>

                {/* Versions */}
                {(viewing.previous_version || viewing.new_version) && (
                  <section>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                      {t("detail.versions")}
                    </h3>
                    <dl className="space-y-3 text-sm">
                      {viewing.previous_version && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            {t("form.previousVersion")}
                          </dt>
                          <dd className="font-medium">{viewing.previous_version}</dd>
                        </div>
                      )}
                      {viewing.new_version && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">
                            {t("form.newVersion")}
                          </dt>
                          <dd className="font-medium">{viewing.new_version}</dd>
                        </div>
                      )}
                    </dl>
                  </section>
                )}

                {/* Impact & Flags */}
                <section>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                    {t("form.impact")}
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">{t("table.impact")}</dt>
                      <dd>
                        <StatusBadge
                          status={viewing.impact}
                          label={t(`impacts.${viewing.impact}`)}
                        />
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">
                        {t("form.isSubstantial")}
                      </dt>
                      <dd>
                        {viewing.is_substantial ? (
                          <CheckCircle className="size-4 text-orange-500" />
                        ) : (
                          <XCircle className="size-4 text-muted-foreground/40" />
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">
                        {t("form.riskReassessment")}
                      </dt>
                      <dd>
                        {viewing.risk_reassessment_required ? (
                          <CheckCircle className="size-4 text-red-500" />
                        ) : (
                          <XCircle className="size-4 text-muted-foreground/40" />
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("messages.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPage>
  );
}
