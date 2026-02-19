import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  Decision,
  DecisionInsert,
  DecisionUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface DecisionFilters {
  decision_type?: string;
  status?: string;
  impact?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useDecisions(filters?: DecisionFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["decisions", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("decisions")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.decision_type) {
        query = query.eq("decision_type", filters.decision_type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.impact) {
        query = query.eq("impact", filters.impact);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,context.ilike.%${filters.search}%,justification.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Decision[];
    },
    enabled: !!orgId,
  });
}

export function useDecision(id: string | undefined) {
  return useQuery({
    queryKey: ["decision", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Decision;
    },
    enabled: !!id,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateDecision() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<DecisionInsert, "organization_id" | "created_by">
    ) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const record = {
        ...input,
        organization_id: profile.organization_id,
        requester_id: input.requester_id ?? user.id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("decisions")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as Decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      log({
        action: "create",
        resource_type: "decision",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdateDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: DecisionUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("decisions")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Decision;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["decision", variables.id] });
      log({
        action: "update",
        resource_type: "decision",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteDecision() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("decisions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      log({
        action: "delete",
        resource_type: "decision",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  STATUS TRANSITIONS                                                 */
/* ------------------------------------------------------------------ */

export function useSubmitDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("decisions")
        .update({ status: "submitted", updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["decision", data.id] });
      log({
        action: "submit",
        resource_type: "decision",
        resource_id: data.id,
        changes: { status: { old: "draft", new: "submitted" } },
      });
    },
  });
}

export function useApproveDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("decisions")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          updated_by: user.id,
        } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["decision", data.id] });
      log({
        action: "approve",
        resource_type: "decision",
        resource_id: data.id,
        changes: { status: { old: "submitted", new: "approved" } },
      });
    },
  });
}

export function useRejectDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id, rejection_reason }: { id: string; rejection_reason: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("decisions")
        .update({
          status: "rejected",
          rejection_reason,
          updated_by: user.id,
        } as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Decision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["decision", data.id] });
      log({
        action: "reject",
        resource_type: "decision",
        resource_id: data.id,
        changes: { status: { old: "in_review", new: "rejected" } },
      });
    },
  });
}
