import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export interface DiagnosticResult {
  id: string;
  user_id: string;
  organization_id: string | null;
  total_score: number;
  maturity_level: string;
  answers: Record<string, number>;
  completed_at: string;
  created_at: string;
}

interface PendingDiagnostic {
  answers: Record<string, number>;
  score: number;
  level: string;
  completedAt: string;
}

const STORAGE_KEY = "gouvernance:diagnostic:pending";

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

/**
 * Get the most recent diagnostic for the current user
 */
export function useLatestDiagnostic() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["diagnostic", "latest", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("governance_diagnostics")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as DiagnosticResult | null;
    },
    enabled: !!user,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

/**
 * Save a diagnostic result to the database
 */
export function useSaveDiagnostic() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pending: PendingDiagnostic) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("governance_diagnostics")
        .insert({
          user_id: user.id,
          organization_id: profile?.organization_id ?? null,
          total_score: pending.score,
          maturity_level: pending.level,
          answers: pending.answers,
          completed_at: pending.completedAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiagnosticResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diagnostic"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

/**
 * Check if there's a pending diagnostic in localStorage
 */
export function getPendingDiagnostic(): PendingDiagnostic | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed.completedAt || !parsed.score || !parsed.answers) return null;
    return parsed as PendingDiagnostic;
  } catch {
    return null;
  }
}

/**
 * Clear pending diagnostic from localStorage
 */
export function clearPendingDiagnostic(): void {
  localStorage.removeItem(STORAGE_KEY);
}
