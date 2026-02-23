import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AgentTrace } from "@/types/database";

export interface AgentTraceFilters {
  agent_id?: string;
  decision_type?: string;
  risk_level?: string;
  event_type?: string;
}

export function useAgentTraces(filters?: AgentTraceFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["agent-traces", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];
      let query = supabase
        .from("agent_traces")
        .select("*")
        .eq("organization_id", orgId);
      if (filters?.agent_id) query = query.eq("agent_id", filters.agent_id);
      if (filters?.decision_type) query = query.eq("decision_type", filters.decision_type);
      if (filters?.risk_level) query = query.eq("risk_level", filters.risk_level);
      if (filters?.event_type) query = query.eq("event_type", filters.event_type);
      query = query.order("created_at", { ascending: false }).limit(200);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AgentTrace[];
    },
    enabled: !!orgId,
  });
}

export function useRecentAgentTraces(limit = 5) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["agent-traces-recent", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("agent_traces")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AgentTrace[];
    },
    enabled: !!orgId,
  });
}
