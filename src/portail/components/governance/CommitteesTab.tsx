import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useOrgMembers } from "@/hooks/useOrgMembers";
import {
  useCommittees,
  useCreateCommittee,
  useUpdateCommittee,
  useDeleteCommittee,
} from "@/hooks/useCommittees";
import type {
  GovernanceCommittee,
  CommitteeMember,
} from "@/types/database";

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
import { DEMO_COMMITTEES } from "@/portail/demo";

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const FREQUENCIES = ["weekly", "monthly", "quarterly", "ad_hoc"] as const;

const COMMITTEE_ROLES = ["president", "member", "secretary"] as const;

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function CommitteesTab({ readOnly = false, isPreview = false }: { readOnly?: boolean; isPreview?: boolean }) {
  const { t } = useTranslation("governance");

  const { data: realCommittees, isLoading: realLoading } = useCommittees();
  const committees = isPreview ? DEMO_COMMITTEES : realCommittees;
  const isLoading = isPreview ? false : realLoading;
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
      members: validMembers as unknown as import("@/types/database").Json,
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
    return Array.isArray(c.members) ? (c.members as unknown[]).length : 0;
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
              {(committees ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {c.mandate || "---"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {String(t(`committees.frequencies.${c.meeting_frequency}`))}
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
