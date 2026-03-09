import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { applySearch } from "@/lib/supabase-helpers";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  AutomatedDecision,
  AutomatedDecisionInsert,
  AutomatedDecisionUpdate,
  Contestation,
  ContestationInsert,
  ContestationUpdate,
} from "@/types/database";
import type { TableInsert, TableUpdate } from "@/lib/supabase-types";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface AutomatedDecisionFilters {
  ai_system_id?: string;
  status?: string;
  search?: string;
}

export interface ContestationFilters {
  ai_system_id?: string;
  status?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES — Automated Decisions                                      */
/* ------------------------------------------------------------------ */

export function useAutomatedDecisions(filters?: AutomatedDecisionFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["automatedDecisions", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("automated_decisions")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      query = applySearch(query, filters?.search, ["decision_type", "information_channel"]);

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AutomatedDecision[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Create Automated Decision                              */
/* ------------------------------------------------------------------ */

export function useCreateAutomatedDecision() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<AutomatedDecisionInsert, "organization_id" | "created_by">
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
        .from("automated_decisions")
        .insert(record as TableInsert<"automated_decisions">)
        .select()
        .single();

      if (error) throw error;
      return data as AutomatedDecision;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automatedDecisions"] });
      log({
        action: "create",
        resource_type: "automated_decision",
        resource_id: data.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Update Automated Decision                              */
/* ------------------------------------------------------------------ */

export function useUpdateAutomatedDecision() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: AutomatedDecisionUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("automated_decisions")
        .update({ ...input, updated_by: user.id } as TableUpdate<"automated_decisions">)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as AutomatedDecision;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automatedDecisions"] });
      log({
        action: "update",
        resource_type: "automated_decision",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Delete Automated Decision                              */
/* ------------------------------------------------------------------ */

export function useDeleteAutomatedDecision() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("automated_decisions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["automatedDecisions"] });
      log({
        action: "delete",
        resource_type: "automated_decision",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  QUERIES — Contestations                                            */
/* ------------------------------------------------------------------ */

export function useContestations(filters?: ContestationFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["contestations", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("contestations")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      query = applySearch(query, filters?.search, ["case_number", "requester_name", "contested_decision_description"]);

      query = query.order("received_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Contestation[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Create Contestation                                    */
/* ------------------------------------------------------------------ */

export function useCreateContestation() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<ContestationInsert, "organization_id" | "created_by" | "case_number">
    ) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const case_number = `CONT-${year}-${rand}`;

      const record = {
        ...input,
        case_number,
        organization_id: profile.organization_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("contestations")
        .insert(record as TableInsert<"contestations">)
        .select()
        .single();

      if (error) throw error;
      return data as Contestation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contestations"] });
      log({
        action: "create",
        resource_type: "contestation",
        resource_id: data.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Update Contestation                                    */
/* ------------------------------------------------------------------ */

export function useUpdateContestation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: ContestationUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("contestations")
        .update({ ...input, updated_by: user.id } as TableUpdate<"contestations">)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Contestation;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contestations"] });
      log({
        action: "update",
        resource_type: "contestation",
        resource_id: variables.id,
      });
    },
  });
}
