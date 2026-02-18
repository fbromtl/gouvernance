import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  GovernanceRole,
  GovernanceRoleInsert,
  GovernanceRoleUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface GovernanceRoleFilters {
  role_type?: string;
  status?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useGovernanceRoles(filters?: GovernanceRoleFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["governance-roles", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("governance_roles")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.role_type) {
        query = query.eq("role_type", filters.role_type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      query = query.order("role_type", { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as GovernanceRole[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateGovernanceRole() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<GovernanceRoleInsert, "organization_id" | "created_by">
    ) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const record = {
        ...input,
        organization_id: profile.organization_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("governance_roles")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as GovernanceRole;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["governance-roles"] });
      log({
        action: "create",
        resource_type: "governance_role",
        resource_id: data.id,
        changes: {
          role_type: { old: null, new: data.role_type },
          user_id: { old: null, new: data.user_id },
        },
      });
    },
  });
}

export function useUpdateGovernanceRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: GovernanceRoleUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("governance_roles")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GovernanceRole;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["governance-roles"] });
      log({
        action: "update",
        resource_type: "governance_role",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteGovernanceRole() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("governance_roles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["governance-roles"] });
      log({
        action: "delete",
        resource_type: "governance_role",
        resource_id: id,
      });
    },
  });
}
