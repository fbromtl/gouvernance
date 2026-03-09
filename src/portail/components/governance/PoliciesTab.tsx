import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Send,
  BookCheck,
  Archive,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  usePublishPolicy,
  useCreatePolicyVersion,
} from "@/hooks/usePolicies";
import type { GovernancePolicy } from "@/types/database";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DialogClose,
} from "@/components/ui/dialog";
import { DEMO_POLICIES } from "@/portail/demo";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const ALL = "__all__";

const POLICY_TYPES = [
  "ai_usage",
  "genai_usage",
  "approval_procedure",
  "incident_procedure",
  "complaint_procedure",
  "decommission_procedure",
  "privacy_policy",
  "ethics_charter",
  "custom",
] as const;

const POLICY_STATUSES = ["draft", "in_review", "published", "archived"] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("fr-CA");
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function PoliciesTab({ readOnly = false, isPreview = false }: { readOnly?: boolean; isPreview?: boolean }) {
  const { t } = useTranslation("governance");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      status: statusFilter === ALL ? undefined : statusFilter,
      policy_type: typeFilter === ALL ? undefined : typeFilter,
    }),
    [search, statusFilter, typeFilter]
  );

  const { data: realPolicies, isLoading: realLoading } = usePolicies(filters);
  const policies = isPreview ? DEMO_POLICIES : realPolicies;
  const isLoading = isPreview ? false : realLoading;
  const createMutation = useCreatePolicy();
  const updateMutation = useUpdatePolicy();
  const publishMutation = usePublishPolicy();
  const versionMutation = useCreatePolicyVersion();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GovernancePolicy | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "publish" | "archive";
    policy: GovernancePolicy;
  } | null>(null);

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fType, setFType] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fContent, setFContent] = useState("");

  function openCreate() {
    setEditing(null);
    setFTitle("");
    setFType("");
    setFDesc("");
    setFContent("");
    setFormOpen(true);
  }

  function openEdit(p: GovernancePolicy) {
    setEditing(p);
    setFTitle(p.title);
    setFType(p.policy_type);
    setFDesc(p.description ?? "");
    setFContent(p.content ?? "");
    setFormOpen(true);
  }

  function handleSave() {
    if (!fTitle || !fType) return;

    const payload = {
      title: fTitle,
      policy_type: fType,
      description: fDesc || null,
      content: fContent,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("policies.toast.updated"));
            setFormOpen(false);
          },
          onError: () => toast.error(t("policies.toast.error")),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("policies.toast.created"));
          setFormOpen(false);
        },
        onError: () => toast.error(t("policies.toast.error")),
      });
    }
  }

  function handleSubmitForReview(p: GovernancePolicy) {
    updateMutation.mutate(
      { id: p.id, status: "in_review" },
      {
        onSuccess: () => toast.success(t("policies.toast.submitted")),
        onError: () => toast.error(t("policies.toast.error")),
      }
    );
  }

  function handlePublish() {
    if (!confirmAction?.policy) return;
    publishMutation.mutate(
      { id: confirmAction.policy.id },
      {
        onSuccess: () => {
          toast.success(t("policies.toast.published"));
          setConfirmAction(null);
        },
        onError: () => toast.error(t("policies.toast.error")),
      }
    );
  }

  function handleArchive() {
    if (!confirmAction?.policy) return;
    updateMutation.mutate(
      { id: confirmAction.policy.id, status: "archived" },
      {
        onSuccess: () => {
          toast.success(t("policies.toast.archived"));
          setConfirmAction(null);
        },
        onError: () => toast.error(t("policies.toast.error")),
      }
    );
  }

  function handleNewVersion(p: GovernancePolicy) {
    versionMutation.mutate(
      { sourceId: p.id },
      {
        onSuccess: () => toast.success(t("policies.toast.versionCreated")),
        onError: () => toast.error(t("policies.toast.error")),
      }
    );
  }

  const isEmpty = !policies || policies.length === 0;
  const hasActiveFilters = search || statusFilter !== ALL || typeFilter !== ALL;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("policies.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("policies.description")}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            {t("policies.newPolicy")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("policies.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("policies.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>
              {t("policies.filters.allStatuses")}
            </SelectItem>
            {POLICY_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`policies.statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t("policies.filters.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>
              {t("policies.filters.allTypes")}
            </SelectItem>
            {POLICY_TYPES.map((pt) => (
              <SelectItem key={pt} value={pt}>
                {t(`policies.types.${pt}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table / Empty */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {hasActiveFilters
              ? t("policies.emptyFiltered.title")
              : t("policies.empty.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? t("policies.emptyFiltered.description")
              : t("policies.empty.description")}
          </p>
          {!hasActiveFilters && !readOnly && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("policies.empty.action")}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("policies.columns.title")}</TableHead>
                <TableHead>{t("policies.columns.type")}</TableHead>
                <TableHead>{t("policies.columns.version")}</TableHead>
                <TableHead>{t("policies.columns.status")}</TableHead>
                <TableHead>{t("policies.columns.updatedAt")}</TableHead>
                {!readOnly && (
                  <TableHead className="w-[200px]">
                    {t("policies.columns.actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(policies ?? []).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm">
                    {String(t(`policies.types.${p.policy_type}`))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      v{p.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={p.status}
                      label={String(t(`policies.statuses.${p.status}`))}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(p.updated_at)}
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {p.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(p)}
                              title={t("policies.actions.edit")}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSubmitForReview(p)}
                              title={t("policies.actions.submitForReview")}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {p.status === "in_review" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(p)}
                              title={t("policies.actions.edit")}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setConfirmAction({ type: "publish", policy: p })
                              }
                              title={t("policies.actions.publish")}
                            >
                              <BookCheck className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {p.status === "published" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleNewVersion(p)}
                              title={t("policies.actions.newVersion")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setConfirmAction({ type: "archive", policy: p })
                              }
                              title={t("policies.actions.archive")}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("policies.form.editTitle")
                : t("policies.form.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pol-title">{t("policies.form.title")}</Label>
                <Input
                  id="pol-title"
                  value={fTitle}
                  onChange={(e) => setFTitle(e.target.value)}
                  placeholder={t("policies.form.titlePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("policies.form.type")}</Label>
                <Select value={fType} onValueChange={setFType}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("policies.form.selectType")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        {t(`policies.types.${pt}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-desc">
                {t("policies.form.description")}
              </Label>
              <Textarea
                id="pol-desc"
                value={fDesc}
                onChange={(e) => setFDesc(e.target.value)}
                placeholder={t("policies.form.descriptionPlaceholder")}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-content">
                {t("policies.form.content")}
              </Label>
              <Textarea
                id="pol-content"
                value={fContent}
                onChange={(e) => setFContent(e.target.value)}
                placeholder={t("policies.form.contentPlaceholder")}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("policies.form.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={
                !fTitle ||
                !fType ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {t("policies.form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Publish / Archive Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "publish"
                ? t("policies.confirm.publishTitle")
                : t("policies.confirm.archiveTitle")}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "publish"
                ? t("policies.confirm.publishDescription")
                : t("policies.confirm.archiveDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("policies.form.cancel")}</Button>
            </DialogClose>
            <Button
              variant={
                confirmAction?.type === "archive" ? "destructive" : "default"
              }
              onClick={
                confirmAction?.type === "publish"
                  ? handlePublish
                  : handleArchive
              }
              disabled={publishMutation.isPending || updateMutation.isPending}
            >
              {confirmAction?.type === "publish"
                ? t("policies.confirm.publishButton")
                : t("policies.confirm.archiveButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
