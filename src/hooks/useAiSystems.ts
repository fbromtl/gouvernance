import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { AiSystem, AiSystemInsert, AiSystemUpdate } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface AiSystemFilters {
  lifecycle_status?: string;
  risk_level?: string;
  system_type?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  CLIENT-SIDE RISK SCORE CALCULATOR                                  */
/* ------------------------------------------------------------------ */

/**
 * Mirrors the SQL function `calculate_risk_score`.
 * Autonomy (max 30) + data_types (max 25) + population (max 20) + sensitive_domains (max 25)
 * Capped at 100.
 */
export function calculateRiskScoreClient(
  data: Partial<AiSystemInsert>
): { score: number; level: string } {
  let score = 0;

  // --- Autonomy (max 30) ---
  const autonomyScores: Record<string, number> = {
    full_auto: 30,
    human_on_the_loop: 20,
    human_in_the_loop: 10,
    human_in_command: 5,
  };
  score += autonomyScores[data.autonomy_level ?? ""] ?? 0;

  // --- Data types (max 25) ---
  const dataTypeScores: Record<string, number> = {
    sensitive_data: 25,
    personal_data: 15,
    financial_data: 15,
    public_data: 5,
    synthetic_data: 2,
    no_personal_data: 0,
  };
  let dataMax = 0;
  for (const dt of data.data_types ?? []) {
    const s = dataTypeScores[dt] ?? 0;
    if (s > dataMax) dataMax = s;
  }
  score += dataMax;

  // --- Population (max 20) ---
  const populationScores: Record<string, number> = {
    vulnerable: 20,
    minors: 20,
    public: 15,
    customers: 10,
    prospects: 8,
    employees: 5,
  };
  let popMax = 0;
  for (const p of data.affected_population ?? []) {
    const s = populationScores[p] ?? 0;
    if (s > popMax) popMax = s;
  }
  score += popMax;

  // --- Sensitive domains (max 25) ---
  const domainScores: Record<string, number> = {
    biometric_id: 25,
    justice: 25,
    migration: 25,
    critical_infra: 22,
    health: 20,
    employment: 18,
    credit: 18,
    education: 15,
    housing: 15,
  };
  let domMax = 0;
  for (const d of data.sensitive_domains ?? []) {
    const s = domainScores[d] ?? 0;
    if (s > domMax) domMax = s;
  }
  score += domMax;

  // Cap at 100
  score = Math.min(score, 100);

  // Determine level
  let level: string;
  if (score >= 75) {
    level = "critical";
  } else if (score >= 50) {
    level = "high";
  } else if (score >= 25) {
    level = "limited";
  } else {
    level = "minimal";
  }

  return { score, level };
}

/* ------------------------------------------------------------------ */
/*  LIST AI SYSTEMS                                                    */
/* ------------------------------------------------------------------ */

export function useAiSystems(filters?: AiSystemFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["ai-systems", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("ai_systems")
        .select("*")
        .eq("organization_id", orgId)
        .is("deleted_at", null);

      if (filters?.lifecycle_status) {
        query = query.eq("lifecycle_status", filters.lifecycle_status);
      }
      if (filters?.risk_level) {
        query = query.eq("risk_level", filters.risk_level);
      }
      if (filters?.system_type) {
        query = query.eq("system_type", filters.system_type);
      }
      if (filters?.search) {
        // Sanitize search input for PostgREST filter safety
        const safe = filters.search.replace(/[%_,.*()]/g, "");
        if (safe) {
          query = query.or(
            `name.ilike.%${safe}%,description.ilike.%${safe}%`
          );
        }
      }

      query = query.order("risk_score", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AiSystem[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  GET SINGLE AI SYSTEM                                               */
/* ------------------------------------------------------------------ */

export function useAiSystem(id: string | undefined) {
  return useQuery({
    queryKey: ["ai-system", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("ai_systems")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as AiSystem;
    },
    enabled: !!id,
  });
}

/* ------------------------------------------------------------------ */
/*  CREATE AI SYSTEM                                                   */
/* ------------------------------------------------------------------ */

export function useCreateAiSystem() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<AiSystemInsert, "organization_id" | "created_by">) => {
      if (!user || !profile?.organization_id) {
        throw new Error("Not authenticated");
      }

      const { score, level } = calculateRiskScoreClient(input);

      const record = {
        ...input,
        organization_id: profile.organization_id,
        created_by: user.id,
        updated_by: user.id,
        risk_score: score,
        risk_level: level,
      };

      const { data, error } = await supabase
        .from("ai_systems")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as AiSystem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-systems"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  UPDATE AI SYSTEM                                                   */
/* ------------------------------------------------------------------ */

export function useUpdateAiSystem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: AiSystemUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { score, level } = calculateRiskScoreClient(input);

      const record = {
        ...input,
        updated_by: user.id,
        risk_score: score,
        risk_level: level,
      };

      const { data, error } = await supabase
        .from("ai_systems")
        .update(record as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as AiSystem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-systems"] });
      queryClient.invalidateQueries({ queryKey: ["ai-system", variables.id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  SOFT DELETE AI SYSTEM                                              */
/* ------------------------------------------------------------------ */

export function useDeleteAiSystem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ai_systems")
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user.id,
        } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-systems"] });
    },
  });
}
