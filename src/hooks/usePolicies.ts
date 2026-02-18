import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  GovernancePolicy,
  GovernancePolicyInsert,
  GovernancePolicyUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface PolicyFilters {
  status?: string;
  policy_type?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function usePolicies(filters?: PolicyFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["governance-policies", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("governance_policies")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.policy_type) {
        query = query.eq("policy_type", filters.policy_type);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as GovernancePolicy[];
    },
    enabled: !!orgId,
  });
}

export function usePolicy(id: string | undefined) {
  return useQuery({
    queryKey: ["governance-policy", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("governance_policies")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as GovernancePolicy;
    },
    enabled: !!id,
  });
}

export function usePolicyVersions(policyId: string | undefined) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["governance-policy-versions", policyId],
    queryFn: async () => {
      if (!policyId || !orgId) return [];

      // Get the root policy to find the chain
      const { data: current, error: fetchError } = await supabase
        .from("governance_policies")
        .select("*")
        .eq("id", policyId)
        .single();

      if (fetchError) throw fetchError;
      if (!current) return [];

      const rootId = (current as GovernancePolicy).parent_id || (current as GovernancePolicy).id;

      // Get all versions in the chain
      const { data, error } = await supabase
        .from("governance_policies")
        .select("*")
        .eq("organization_id", orgId)
        .or(`id.eq.${rootId},parent_id.eq.${rootId}`)
        .order("version", { ascending: false });

      if (error) throw error;
      return (data ?? []) as GovernancePolicy[];
    },
    enabled: !!policyId && !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<GovernancePolicyInsert, "organization_id" | "created_by">
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
        .from("governance_policies")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as GovernancePolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      log({
        action: "create",
        resource_type: "governance_policy",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: GovernancePolicyUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("governance_policies")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GovernancePolicy;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      queryClient.invalidateQueries({
        queryKey: ["governance-policy", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["governance-policy-versions"],
      });
      log({
        action: "update",
        resource_type: "governance_policy",
        resource_id: variables.id,
      });
    },
  });
}

export function usePublishPolicy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("governance_policies")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          published_by: user.id,
          updated_by: user.id,
        } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GovernancePolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      queryClient.invalidateQueries({
        queryKey: ["governance-policy", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["governance-policy-versions"],
      });
      log({
        action: "approve",
        resource_type: "governance_policy",
        resource_id: data.id,
        changes: { status: { old: "in_review", new: "published" } },
      });
    },
  });
}

export function useCreatePolicyVersion() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ sourceId }: { sourceId: string }) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      // 1. Fetch the source policy
      const { data: source, error: fetchError } = await supabase
        .from("governance_policies")
        .select("*")
        .eq("id", sourceId)
        .single();

      if (fetchError) throw fetchError;
      if (!source) throw new Error("Source policy not found");

      const src = source as GovernancePolicy;

      // 2. Archive the source
      await supabase
        .from("governance_policies")
        .update({ status: "archived", updated_by: user.id } as any)
        .eq("id", sourceId);

      // 3. Create new version
      const rootId = src.parent_id || src.id;
      const newRecord = {
        organization_id: profile.organization_id,
        title: src.title,
        description: src.description,
        policy_type: src.policy_type,
        content: src.content,
        version: src.version + 1,
        parent_id: rootId,
        status: "draft",
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("governance_policies")
        .insert(newRecord as any)
        .select()
        .single();

      if (error) throw error;
      return data as GovernancePolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["governance-policies"] });
      queryClient.invalidateQueries({
        queryKey: ["governance-policy-versions"],
      });
      log({
        action: "create",
        resource_type: "governance_policy",
        resource_id: data.id,
        changes: {
          version: { old: data.version - 1, new: data.version },
        },
      });
    },
  });
}
