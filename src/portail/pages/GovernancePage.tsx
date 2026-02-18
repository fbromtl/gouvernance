import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Users,
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  Send,
  BookCheck,
  Archive,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { usePermissions } from "@/hooks/usePermissions";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import type { OrgMember } from "@/hooks/useOrgMembers";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  usePolicies,
  useCreatePolicy,
  useUpdatePolicy,
  usePublishPolicy,
  useCreatePolicyVersion,
} from "@/hooks/usePolicies";
import {
  useGovernanceRoles,
  useCreateGovernanceRole,
  useUpdateGovernanceRole,
  useDeleteGovernanceRole,
} from "@/hooks/useGovernanceRoles";
import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
  useDeleteCommittee,
} from "@/hooks/useCommittees";

import type {
  GovernancePolicy,
  GovernanceRole,
  GovernanceCommittee,
  CommitteeMember,
} from "@/types/database";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const GOV_ROLE_TYPES = [
  "sponsor",
  "ai_lead",
  "privacy_officer",
  "risk_officer",
  "security_officer",
  "ethics_officer",
  "legal_counsel",
  "model_owner",
  "approver",
] as const;

const FREQUENCIES = ["weekly", "monthly", "quarterly", "ad_hoc"] as const;

const COMMITTEE_ROLES = ["president", "member", "secretary"] as const;

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("fr-CA");
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function findMember(members: OrgMember[] | undefined, userId: string | null) {
  if (!members || !userId) return null;
  return members.find((m) => m.user_id === userId) ?? null;
}

/* ================================================================== */
/*  POLICIES TAB                                                       */
/* ================================================================== */

function PoliciesTab({ readOnly = false }: { readOnly?: boolean }) {
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

  const { data: policies, isLoading } = usePolicies(filters);
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
              {policies!.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm">
                    {t(`policies.types.${p.policy_type}` as any)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      v{p.version}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={p.status}
                      label={t(`policies.statuses.${p.status}` as any)}
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

/* ================================================================== */
/*  ROLES TAB                                                          */
/* ================================================================== */

function RolesTab({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation("governance");

  const { data: roles, isLoading } = useGovernanceRoles();
  const { data: members } = useOrgMembers();
  const { data: aiSystems } = useAiSystems();

  const createMutation = useCreateGovernanceRole();
  const updateMutation = useUpdateGovernanceRole();
  const deleteMutation = useDeleteGovernanceRole();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GovernanceRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<GovernanceRole | null>(null);

  // Form state
  const [fRoleType, setFRoleType] = useState("");
  const [fUserId, setFUserId] = useState("");
  const [fMandate, setFMandate] = useState("");
  const [fNominatedAt, setFNominatedAt] = useState("");
  const [fScope, setFScope] = useState("global");
  const [fAiSystemId, setFAiSystemId] = useState("");

  function openCreate() {
    setEditing(null);
    setFRoleType("");
    setFUserId("");
    setFMandate("");
    setFNominatedAt("");
    setFScope("global");
    setFAiSystemId("");
    setFormOpen(true);
  }

  function openEdit(r: GovernanceRole) {
    setEditing(r);
    setFRoleType(r.role_type);
    setFUserId(r.user_id ?? "");
    setFMandate(r.mandate ?? "");
    setFNominatedAt(r.nominated_at ?? "");
    setFScope(r.scope);
    setFAiSystemId(r.ai_system_id ?? "");
    setFormOpen(true);
  }

  function handleSave() {
    if (!fRoleType) return;

    const payload = {
      role_type: fRoleType,
      user_id: fUserId || null,
      mandate: fMandate || null,
      nominated_at: fNominatedAt || null,
      scope: fScope,
      ai_system_id: fScope === "per_system" && fAiSystemId ? fAiSystemId : null,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("roles.toast.updated"));
            setFormOpen(false);
          },
          onError: () => toast.error(t("roles.toast.error")),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("roles.toast.created"));
          setFormOpen(false);
        },
        onError: () => toast.error(t("roles.toast.error")),
      });
    }
  }

  function handleDelete() {
    if (!deletingRole) return;
    deleteMutation.mutate(deletingRole.id, {
      onSuccess: () => {
        toast.success(t("roles.toast.deleted"));
        setDeletingRole(null);
      },
      onError: () => toast.error(t("roles.toast.error")),
    });
  }

  // Check Loi 25 compliance
  const hasPrivacyOfficer =
    roles?.some(
      (r) => r.role_type === "privacy_officer" && r.status === "active" && r.user_id
    ) ?? false;

  const isEmpty = !roles || roles.length === 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("roles.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("roles.description")}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            {t("roles.assignRole")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Loi 25 Warning */}
      {!hasPrivacyOfficer && !isLoading && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t("roles.loi25Warning")}</AlertDescription>
        </Alert>
      )}

      {/* Table / Empty */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t("roles.empty.title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("roles.empty.description")}
          </p>
          {!readOnly && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("roles.empty.action")}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("roles.columns.role")}</TableHead>
                <TableHead>{t("roles.columns.assignee")}</TableHead>
                <TableHead>{t("roles.columns.scope")}</TableHead>
                <TableHead>{t("roles.columns.nominatedAt")}</TableHead>
                <TableHead>{t("roles.columns.status")}</TableHead>
                {!readOnly && (
                  <TableHead className="w-[100px]">
                    {t("roles.columns.actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles!.map((r) => {
                const member = findMember(members, r.user_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {t(`roles.roleTypes.${r.role_type}` as any)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {t(`roles.roleDescriptions.${r.role_type}` as any)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={member.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {member.full_name || member.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("roles.unassigned")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t(`roles.scopes.${r.scope}` as any)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.nominated_at)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(r)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingRole(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("roles.form.editTitle")
                : t("roles.form.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("roles.form.roleType")}</Label>
              <Select value={fRoleType} onValueChange={setFRoleType}>
                <SelectTrigger>
                  <SelectValue placeholder={t("roles.form.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {GOV_ROLE_TYPES.map((rt) => (
                    <SelectItem key={rt} value={rt}>
                      {t(`roles.roleTypes.${rt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("roles.form.assignee")}</Label>
              <Select value={fUserId} onValueChange={setFUserId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("roles.form.selectAssignee")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(members ?? []).map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.full_name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-mandate">{t("roles.form.mandate")}</Label>
              <Textarea
                id="role-mandate"
                value={fMandate}
                onChange={(e) => setFMandate(e.target.value)}
                placeholder={t("roles.form.mandatePlaceholder")}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-date">
                  {t("roles.form.nominatedAt")}
                </Label>
                <Input
                  id="role-date"
                  type="date"
                  value={fNominatedAt}
                  onChange={(e) => setFNominatedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("roles.form.scope")}</Label>
                <Select value={fScope} onValueChange={setFScope}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">
                      {t("roles.scopes.global")}
                    </SelectItem>
                    <SelectItem value="per_system">
                      {t("roles.scopes.per_system")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {fScope === "per_system" && (
              <div className="space-y-2">
                <Label>{t("roles.form.aiSystem")}</Label>
                <Select value={fAiSystemId} onValueChange={setFAiSystemId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("roles.form.selectAiSystem")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(aiSystems ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("roles.form.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={
                !fRoleType ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {t("roles.form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("roles.confirm.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("roles.confirm.deleteDescription", {
                role: deletingRole
                  ? t(`roles.roleTypes.${deletingRole.role_type}` as any)
                  : "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("roles.form.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {t("roles.confirm.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ================================================================== */
/*  COMMITTEES TAB                                                     */
/* ================================================================== */

function CommitteesTab({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation("governance");

  const { data: committees, isLoading } = useCommittees();
  const { data: members } = useOrgMembers();

  const createMutation = useCreateCommittee();
  const updateMutation = useUpdateCommittee();
  const deleteMutation = useDeleteCommittee();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GovernanceCommittee | null>(null);
  const [deletingCommittee, setDeletingCommittee] =
    useState<GovernanceCommittee | null>(null);

  // Form state
  const [fName, setFName] = useState("");
  const [fMandate, setFMandate] = useState("");
  const [fFrequency, setFFrequency] = useState("quarterly");
  const [fMembers, setFMembers] = useState<CommitteeMember[]>([]);

  function openCreate() {
    setEditing(null);
    setFName("");
    setFMandate("");
    setFFrequency("quarterly");
    setFMembers([]);
    setFormOpen(true);
  }

  function openEdit(c: GovernanceCommittee) {
    setEditing(c);
    setFName(c.name);
    setFMandate(c.mandate ?? "");
    setFFrequency(c.meeting_frequency);
    setFMembers(
      Array.isArray(c.members) ? (c.members as unknown as CommitteeMember[]) : []
    );
    setFormOpen(true);
  }

  function addMember() {
    setFMembers([...fMembers, { user_id: "", committee_role: "member" }]);
  }

  function updateMember(
    index: number,
    field: keyof CommitteeMember,
    value: string
  ) {
    const updated = [...fMembers];
    updated[index] = { ...updated[index], [field]: value } as CommitteeMember;
    setFMembers(updated);
  }

  function removeMember(index: number) {
    setFMembers(fMembers.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!fName) return;

    // Filter out members without user_id selected
    const validMembers = fMembers.filter((m) => m.user_id);

    const payload = {
      name: fName,
      mandate: fMandate || null,
      meeting_frequency: fFrequency,
      members: validMembers as any,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("committees.toast.updated"));
            setFormOpen(false);
          },
          onError: () => toast.error(t("committees.toast.error")),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("committees.toast.created"));
          setFormOpen(false);
        },
        onError: () => toast.error(t("committees.toast.error")),
      });
    }
  }

  function handleDelete() {
    if (!deletingCommittee) return;
    deleteMutation.mutate(deletingCommittee.id, {
      onSuccess: () => {
        toast.success(t("committees.toast.deleted"));
        setDeletingCommittee(null);
      },
      onError: () => toast.error(t("committees.toast.error")),
    });
  }

  function getMemberCount(c: GovernanceCommittee) {
    return Array.isArray(c.members) ? (c.members as any[]).length : 0;
  }

  const isEmpty = !committees || committees.length === 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("committees.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("committees.description")}
          </p>
        </div>
        {!readOnly && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            {t("committees.newCommittee")}
          </Button>
        )}
      </div>

      <Separator />

      {/* Table / Empty */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {t("committees.empty.title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("committees.empty.description")}
          </p>
          {!readOnly && (
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              {t("committees.empty.action")}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("committees.columns.name")}</TableHead>
                <TableHead>{t("committees.columns.mandate")}</TableHead>
                <TableHead>{t("committees.columns.frequency")}</TableHead>
                <TableHead>{t("committees.columns.members")}</TableHead>
                <TableHead>{t("committees.columns.status")}</TableHead>
                {!readOnly && (
                  <TableHead className="w-[100px]">
                    {t("committees.columns.actions")}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {committees!.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {c.mandate || "---"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {t(`committees.frequencies.${c.meeting_frequency}` as any)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {t("committees.memberCount", {
                        count: getMemberCount(c),
                      })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingCommittee(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("committees.form.editTitle")
                : t("committees.form.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="com-name">{t("committees.form.name")}</Label>
              <Input
                id="com-name"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder={t("committees.form.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="com-mandate">
                {t("committees.form.mandate")}
              </Label>
              <Textarea
                id="com-mandate"
                value={fMandate}
                onChange={(e) => setFMandate(e.target.value)}
                placeholder={t("committees.form.mandatePlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("committees.form.frequency")}</Label>
              <Select value={fFrequency} onValueChange={setFFrequency}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("committees.form.selectFrequency")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f}>
                      {t(`committees.frequencies.${f}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("committees.form.members")}</Label>
                <Button variant="outline" size="sm" onClick={addMember}>
                  <Plus className="mr-1 h-3 w-3" />
                  {t("committees.form.addMember")}
                </Button>
              </div>
              {fMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("committees.noMembers")}
                </p>
              )}
              {fMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={m.user_id}
                    onValueChange={(v) => updateMember(i, "user_id", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={t("committees.form.selectMember")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(members ?? []).map((om) => (
                        <SelectItem key={om.user_id} value={om.user_id}>
                          {om.full_name || om.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={m.committee_role}
                    onValueChange={(v) => updateMember(i, "committee_role", v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMITTEE_ROLES.map((cr) => (
                        <SelectItem key={cr} value={cr}>
                          {t(`committees.committeeRoles.${cr}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeMember(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("committees.form.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={
                !fName ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {t("committees.form.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCommittee}
        onOpenChange={(open) => !open && setDeletingCommittee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("committees.confirm.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("committees.confirm.deleteDescription", {
                name: deletingCommittee?.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                {t("committees.form.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {t("committees.confirm.deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */

export default function GovernancePage() {
  const { t } = useTranslation("governance");
  const { can } = usePermissions();

  const readOnly = !can("manage_policies");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

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
          <PoliciesTab readOnly={readOnly} />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTab readOnly={readOnly} />
        </TabsContent>
        <TabsContent value="committees">
          <CommitteesTab readOnly={readOnly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
