import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AgentPolicy, AgentPolicyInsert } from "@/types/database";

export function useAgentPolicies() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["agent-policies", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("agent_policies")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AgentPolicy[];
    },
    enabled: !!orgId,
  });
}

export function useCreateAgentPolicy() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  return useMutation({
    mutationFn: async (params: Omit<AgentPolicyInsert, "organization_id">) => {
      const orgId = profile?.organization_id;
      if (!orgId) throw new Error("No organization");
      const { data, error } = await supabase
        .from("agent_policies")
        .insert({ ...params, organization_id: orgId })
        .select()
        .single();
      if (error) throw error;
      return data as AgentPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-policies"] });
    },
  });
}

export function useToggleAgentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from("agent_policies")
        .update({ active })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AgentPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-policies"] });
    },
  });
}
