import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";

/* ------------------------------------------------------------------ */
/*  Update organization                                                 */
/* ------------------------------------------------------------------ */

interface OrgUpdate {
  name?: string;
  sector?: string | null;
  size?: string | null;
  country?: string | null;
  province?: string | null;
}

export function useUpdateOrganization() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { log } = useAuditLog();
  const orgId = profile?.organization_id;

  return useMutation({
    mutationFn: async (updates: OrgUpdate) => {
      if (!orgId) throw new Error("No organization");
      const { error } = await supabase
        .from("organizations")
        .update(updates as any)
        .eq("id", orgId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organization", orgId] });
      log({
        action: "update",
        resource_type: "organization",
        resource_id: orgId ?? undefined,
        changes: Object.fromEntries(
          Object.entries(variables).map(([k, v]) => [k, { old: null, new: v }])
        ),
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Update member role                                                  */
/* ------------------------------------------------------------------ */

interface RoleUpdate {
  userId: string;
  role: string;
  previousRole: string;
}

export function useUpdateMemberRole() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { log } = useAuditLog();
  const orgId = profile?.organization_id;

  return useMutation({
    mutationFn: async ({ userId, role }: RoleUpdate) => {
      if (!orgId) throw new Error("No organization");
      const { error } = await supabase
        .from("user_roles")
        .update({ role } as any)
        .eq("user_id", userId)
        .eq("organization_id", orgId);
      if (error) throw error;
    },
    onSuccess: (_data, { userId, role, previousRole }) => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      log({
        action: "update",
        resource_type: "user_role",
        resource_id: userId,
        changes: { role: { old: previousRole, new: role } },
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Remove member                                                       */
/* ------------------------------------------------------------------ */

interface RemoveMemberArgs {
  userId: string;
  memberName: string;
}

export function useRemoveMember() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { log } = useAuditLog();
  const orgId = profile?.organization_id;

  return useMutation({
    mutationFn: async ({ userId }: RemoveMemberArgs) => {
      if (!orgId) throw new Error("No organization");
      // Remove role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("organization_id", orgId);
      if (roleError) throw roleError;
      // Unlink from org
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: null } as any)
        .eq("id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: (_data, { userId, memberName }) => {
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
      log({
        action: "delete",
        resource_type: "user_role",
        resource_id: userId,
        changes: { member: { old: memberName, new: null } },
      });
    },
  });
}
