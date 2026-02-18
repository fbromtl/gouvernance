import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  GovernanceCommittee,
  GovernanceCommitteeInsert,
  GovernanceCommitteeUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useCommittees() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["governance-committees", orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from("governance_committees")
        .select("*")
        .eq("organization_id", orgId)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as GovernanceCommittee[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateCommittee() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<GovernanceCommitteeInsert, "organization_id" | "created_by">
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
        .from("governance_committees")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as GovernanceCommittee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["governance-committees"] });
      log({
        action: "create",
        resource_type: "governance_committee",
        resource_id: data.id,
        changes: { name: { old: null, new: data.name } },
      });
    },
  });
}

export function useUpdateCommittee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: GovernanceCommitteeUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("governance_committees")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GovernanceCommittee;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["governance-committees"] });
      log({
        action: "update",
        resource_type: "governance_committee",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteCommittee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("governance_committees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["governance-committees"] });
      log({
        action: "delete",
        resource_type: "governance_committee",
        resource_id: id,
      });
    },
  });
}
