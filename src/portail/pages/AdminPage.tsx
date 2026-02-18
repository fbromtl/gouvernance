import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Save,
  Copy,
  Trash2,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMembers } from "@/hooks/useOrgMembers";
import {
  useUpdateOrganization,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useAdminMutations";
import { ROLES } from "@/lib/permissions";
import type { Organization } from "@/types/database";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  Sector / size option lists                                          */
/* ------------------------------------------------------------------ */

const SECTORS = [
  "finance", "healthcare", "education", "government", "technology",
  "retail", "manufacturing", "energy", "telecom", "other",
] as const;

const SIZES = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"] as const;

/* ================================================================== */
/*  ADMIN PAGE                                                         */
/* ================================================================== */

export default function AdminPage() {
  const { t } = useTranslation("admin");
  const { can } = usePermissions();

  if (!can("manage_organization")) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("accessDenied.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("accessDenied.description")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            {t("tabs.organization")}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            {t("tabs.members")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <OrgSettingsTab />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================================================================== */
/*  ORGANIZATION SETTINGS TAB                                          */
/* ================================================================== */

function OrgSettingsTab() {
  const { t } = useTranslation("admin");
  const { data: org } = useOrganization() as { data: Organization | null | undefined };
  const updateOrg = useUpdateOrganization();

  const [name, setName] = useState(org?.name ?? "");
  const [sector, setSector] = useState(org?.sector ?? "");
  const [size, setSize] = useState(org?.size ?? "");
  const [country, setCountry] = useState(org?.country ?? "");
  const [province, setProvince] = useState(org?.province ?? "");
  const [initialized, setInitialized] = useState(false);

  // Sync state when org first loads
  if (org && !initialized) {
    setName(org.name ?? "");
    setSector(org.sector ?? "");
    setSize(org.size ?? "");
    setCountry(org.country ?? "");
    setProvince(org.province ?? "");
    setInitialized(true);
  }

  const handleSave = () => {
    updateOrg.mutate(
      { name, sector: sector || null, size: size || null, country: country || null, province: province || null },
      {
        onSuccess: () => toast.success(t("org.saveSuccess")),
        onError: () => toast.error(t("org.saveError")),
      }
    );
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("org.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("org.description")}</p>
      </div>

      <Separator />

      {/* Plan badge */}
      {org?.plan && (
        <div className="flex items-center gap-2">
          <Label>{t("org.plan")}</Label>
          <Badge variant="secondary" className="capitalize">
            {t(`org.plans.${org.plan}` as any)}
          </Badge>
        </div>
      )}

      {/* Form grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="org-name">{t("org.name")}</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("org.namePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("org.sector")}</Label>
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger>
              <SelectValue placeholder={t("org.sectorPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`org.sectors.${s}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("org.size")}</Label>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger>
              <SelectValue placeholder={t("org.sizePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`org.sizes.${s}` as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-country">{t("org.country")}</Label>
          <Input
            id="org-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t("org.countryPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-province">{t("org.province")}</Label>
          <Input
            id="org-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder={t("org.provincePlaceholder")}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateOrg.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {t("org.save")}
        </Button>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  MEMBERS TAB                                                        */
/* ================================================================== */

function MembersTab() {
  const { t } = useTranslation("admin");
  const { user } = useAuth();
  const { role: currentRole } = usePermissions();
  const { data: members = [], isLoading } = useOrgMembers();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const [removingMember, setRemovingMember] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const handleCopyInviteLink = async () => {
    const url = `${window.location.origin}/inscription`;
    await navigator.clipboard.writeText(url);
    toast.success(t("members.inviteLinkCopied"));
  };

  const handleRoleChange = (userId: string, newRole: string, previousRole: string) => {
    updateRole.mutate(
      { userId, role: newRole, previousRole },
      {
        onSuccess: () => toast.success(t("members.roleUpdateSuccess")),
        onError: () => toast.error(t("members.roleUpdateError")),
      }
    );
  };

  const handleRemove = () => {
    if (!removingMember) return;
    removeMember.mutate(
      { userId: removingMember.userId, memberName: removingMember.name },
      {
        onSuccess: () => {
          toast.success(t("members.removeSuccess"));
          setRemovingMember(null);
        },
        onError: () => toast.error(t("members.removeError")),
      }
    );
  };

  const canChangeRole = (member: { user_id: string; role: string }) => {
    if (member.user_id === user?.id) return false;
    if (member.role === "super_admin" && currentRole !== "super_admin") return false;
    return true;
  };

  const assignableRoles = ROLES.filter(
    (r) => currentRole === "super_admin" || r !== "super_admin"
  );

  const initials = (name: string | null) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("members.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("members.description")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
          <Copy className="mr-2 h-4 w-4" />
          {t("members.inviteLink")}
        </Button>
      </div>

      <Separator />

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">...</div>
      ) : members.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t("members.noMembers")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("members.columns.name")}</TableHead>
                <TableHead>{t("members.columns.email")}</TableHead>
                <TableHead>{t("members.columns.role")}</TableHead>
                <TableHead>{t("members.columns.joined")}</TableHead>
                <TableHead className="w-[80px]">{t("members.columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.user_id}>
                  {/* Name + avatar */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={m.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {initials(m.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{m.full_name ?? "—"}</span>
                      {m.user_id === user?.id && (
                        <Badge variant="outline" className="text-[10px]">
                          vous
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>

                  {/* Role select */}
                  <TableCell>
                    <Select
                      value={m.role}
                      onValueChange={(v) => handleRoleChange(m.user_id, v, m.role)}
                      disabled={!canChangeRole(m)}
                    >
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {t(`roles.${r}` as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-muted-foreground">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    {canChangeRole(m) && (
                      <Dialog
                        open={removingMember?.userId === m.user_id}
                        onOpenChange={(open) => {
                          if (!open) setRemovingMember(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setRemovingMember({
                                userId: m.user_id,
                                name: m.full_name ?? m.email,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t("members.removeConfirmTitle")}</DialogTitle>
                            <DialogDescription>
                              {t("members.removeConfirmDescription", {
                                name: removingMember?.name,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setRemovingMember(null)}
                            >
                              {t("members.cancel")}
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleRemove}
                              disabled={removeMember.isPending}
                            >
                              {t("members.removeConfirmButton")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
