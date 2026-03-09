import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { useOrgMembers } from "@/hooks/useOrgMembers";
import type { OrgMember } from "@/hooks/useOrgMembers";
import { useAiSystems } from "@/hooks/useAiSystems";
import {
  useGovernanceRoles,
  useCreateGovernanceRole,
  useUpdateGovernanceRole,
  useDeleteGovernanceRole,
} from "@/hooks/useGovernanceRoles";
import type { GovernanceRole } from "@/types/database";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
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
import { DEMO_GOVERNANCE_ROLES } from "@/portail/demo";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function RolesTab({ readOnly = false, isPreview = false }: { readOnly?: boolean; isPreview?: boolean }) {
  const { t } = useTranslation("governance");

  const { data: realRoles, isLoading: realLoading } = useGovernanceRoles();
  const roles = isPreview ? DEMO_GOVERNANCE_ROLES : realRoles;
  const isLoading = isPreview ? false : realLoading;
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
              {(roles ?? []).map((r) => {
                const member = findMember(members, r.user_id);
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {String(t(`roles.roleTypes.${r.role_type}`))}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {String(t(`roles.roleDescriptions.${r.role_type}`))}
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
                        {String(t(`roles.scopes.${r.scope}`))}
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
                  ? String(t(`roles.roleTypes.${deletingRole.role_type}`))
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
