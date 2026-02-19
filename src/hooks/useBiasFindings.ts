import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  BiasFinding,
  BiasFindingInsert,
  BiasFindingUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface BiasFilters {
  bias_type?: string;
  status?: string;
  severity?: string;
  ai_system_id?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useBiasFindings(filters?: BiasFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["biasFindings", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("bias_findings")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.bias_type) {
        query = query.eq("bias_type", filters.bias_type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,affected_groups.ilike.%${filters.search}%,estimated_impact.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as BiasFinding[];
    },
    enabled: !!orgId,
  });
}

export function useBiasFinding(id: string | undefined) {
  return useQuery({
    queryKey: ["biasFinding", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("bias_findings")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as BiasFinding;
    },
    enabled: !!id,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateBiasFinding() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<BiasFindingInsert, "organization_id" | "created_by">
    ) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const record = {
        ...input,
        organization_id: profile.organization_id,
        detected_by: input.detected_by ?? user.id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("bias_findings")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as BiasFinding;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["biasFindings"] });
      log({
        action: "create",
        resource_type: "bias_finding",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdateBiasFinding() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: BiasFindingUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("bias_findings")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BiasFinding;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["biasFindings"] });
      queryClient.invalidateQueries({ queryKey: ["biasFinding", variables.id] });
      log({
        action: "update",
        resource_type: "bias_finding",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteBiasFinding() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("bias_findings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["biasFindings"] });
      log({
        action: "delete",
        resource_type: "bias_finding",
        resource_id: variables.id,
      });
    },
  });
}
