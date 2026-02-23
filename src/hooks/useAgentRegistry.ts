import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AgentRegistry, AgentRegistryInsert, AgentRegistryUpdate } from "@/types/database";

export function useAgentRegistry() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["agent-registry", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("agent_registry")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AgentRegistry[];
    },
    enabled: !!orgId,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      agent_id: string;
      name: string;
      autonomy_level: string;
      allowed_types?: string[];
      max_risk?: string;
      owner?: { name?: string; email?: string };
      description?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("adp-mcp", {
        body: { tool: "adp_register_agent", ...params },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { agent_id: string; api_key: string; status: string; autonomy_level: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-registry"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & AgentRegistryUpdate) => {
      const { data, error } = await supabase
        .from("agent_registry")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AgentRegistry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-registry"] });
    },
  });
}
