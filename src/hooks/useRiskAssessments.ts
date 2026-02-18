import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { RiskAssessment, RiskAssessmentInsert, RiskAssessmentUpdate } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  CLIENT-SIDE ASSESSMENT SCORE CALCULATOR                            */
/* ------------------------------------------------------------------ */

/**
 * 6-section questionnaire scoring.
 *
 * Section A — Impact (max 25)
 * Section B — EU AI Act classification (max 20)
 * Section C — Data & Privacy (max 20)
 * Section D — Bias & Fairness (max 15)
 * Section E — Transparency (max 10)
 * Section F — Human oversight (max 10)
 *
 * Total capped at 100.
 * If q5 = "oui" the system is flagged "prohibited".
 */
export function calculateAssessmentScore(
  answers: Record<string, string | string[]>,
): { score: number; level: string; isProhibited: boolean } {
  let score = 0;
  let isProhibited = false;

  // ---- Section A — Impact (max 25) ----

  // q1: direct impact on individuals
  const q1Scores: Record<string, number> = { oui_direct: 15, oui_indirect: 8, non: 0 };
  score += q1Scores[answers.q1 as string] ?? 0;

  // q2: reversibility
  const q2Scores: Record<string, number> = { non: 10, difficilement: 5, oui: 0 };
  score += q2Scores[answers.q2 as string] ?? 0;

  // q3: impacts fundamental rights
  const q3Scores: Record<string, number> = { oui: 10, possiblement: 5, non: 0 };
  score += q3Scores[answers.q3 as string] ?? 0;

  // q4: which fundamental rights (multi-select, cumulative — section max still 25 overall via cap)
  const q4Scores: Record<string, number> = {
    privacy: 5,
    non_discrimination: 8,
    employment: 8,
    freedom_expression: 5,
    dignity: 10,
    access_services: 5,
    none: 0,
  };
  const q4Values = Array.isArray(answers.q4) ? answers.q4 : [];
  let q4Total = 0;
  for (const v of q4Values) {
    q4Total += q4Scores[v] ?? 0;
  }
  score += q4Total;

  // ---- Section B — EU AI Act (max 20) ----

  // q5: prohibited practice
  if (answers.q5 === "oui") {
    isProhibited = true;
    // Score still accumulates normally; level override happens below
  }

  // q6: high-risk category (multi-select — any selection = 20)
  const q6Values = Array.isArray(answers.q6) ? answers.q6 : [];
  if (q6Values.length > 0) {
    score += 20;
  }

  // q7: limited risk transparency obligations
  const q7Scores: Record<string, number> = { oui: 10, non: 0 };
  score += q7Scores[answers.q7 as string] ?? 0;

  // ---- Section C — Data & Privacy (max 20) ----

  // q8: personal data type
  const q8Scores: Record<string, number> = { oui_sensibles: 20, oui_standards: 10, non: 0 };
  score += q8Scores[answers.q8 as string] ?? 0;

  // q9: cross-border data transfer
  const q9Scores: Record<string, number> = { oui_hors_canada: 10, oui_canada: 5, non: 0 };
  score += q9Scores[answers.q9 as string] ?? 0;

  // q10: privacy impact assessment
  const q10Scores: Record<string, number> = { non_requis: 10, en_cours: 5, oui: 0 };
  score += q10Scores[answers.q10 as string] ?? 0;

  // ---- Section D — Bias & Fairness (max 15) ----

  // q11: risk of discriminatory bias
  const q11Scores: Record<string, number> = { oui: 10, possiblement: 5, non: 0 };
  score += q11Scores[answers.q11 as string] ?? 0;

  // q12: bias testing conducted
  const q12Scores: Record<string, number> = { non: 10, partiellement: 5, oui: 0 };
  score += q12Scores[answers.q12 as string] ?? 0;

  // q13: uses protected characteristics
  const q13Scores: Record<string, number> = { oui: 15, non: 0 };
  score += q13Scores[answers.q13 as string] ?? 0;

  // ---- Section E — Transparency (max 10) ----

  // q14: explainability
  const q14Scores: Record<string, number> = { non: 10, partiellement: 5, oui: 0 };
  score += q14Scores[answers.q14 as string] ?? 0;

  // q15: users informed
  const q15Scores: Record<string, number> = { non: 5, oui: 0 };
  score += q15Scores[answers.q15 as string] ?? 0;

  // ---- Section F — Human oversight (max 10) ----

  // q16: human review frequency
  const q16Scores: Record<string, number> = { jamais: 10, parfois: 5, toujours: 0 };
  score += q16Scores[answers.q16 as string] ?? 0;

  // q17: override mechanism exists
  const q17Scores: Record<string, number> = { non: 5, oui: 0 };
  score += q17Scores[answers.q17 as string] ?? 0;

  // Cap at 100
  score = Math.min(score, 100);

  // Determine level
  let level: string;
  if (isProhibited) {
    level = "prohibited";
  } else if (score >= 76) {
    level = "critical";
  } else if (score >= 51) {
    level = "high";
  } else if (score >= 26) {
    level = "limited";
  } else {
    level = "minimal";
  }

  return { score, level, isProhibited };
}

/* ------------------------------------------------------------------ */
/*  LIST RISK ASSESSMENTS                                              */
/* ------------------------------------------------------------------ */

export function useRiskAssessments(aiSystemId?: string) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["risk-assessments", orgId, aiSystemId],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("risk_assessments")
        .select("*, ai_systems(name)")
        .eq("organization_id", orgId);

      if (aiSystemId) {
        query = query.eq("ai_system_id", aiSystemId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data ?? []) as (RiskAssessment & { ai_systems: { name: string } | null })[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  GET SINGLE RISK ASSESSMENT                                         */
/* ------------------------------------------------------------------ */

export function useRiskAssessment(id: string | undefined) {
  return useQuery({
    queryKey: ["risk-assessment", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from("risk_assessments")
        .select("*, ai_systems(name)")
        .eq("id", id)
        .single() as any);

      if (error) throw error;
      return data as RiskAssessment & { ai_systems: { name: string } | null };
    },
    enabled: !!id,
  });
}

/* ------------------------------------------------------------------ */
/*  CREATE RISK ASSESSMENT                                             */
/* ------------------------------------------------------------------ */

export function useCreateRiskAssessment() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (
      input: Omit<RiskAssessmentInsert, "organization_id" | "created_by">,
    ) => {
      if (!user || !profile?.organization_id) {
        throw new Error("Not authenticated");
      }

      const record = {
        ...input,
        organization_id: profile.organization_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("risk_assessments")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as RiskAssessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  UPDATE RISK ASSESSMENT                                             */
/* ------------------------------------------------------------------ */

export function useUpdateRiskAssessment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: RiskAssessmentUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const record = {
        ...input,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("risk_assessments")
        .update(record as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as RiskAssessment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["risk-assessment", variables.id] });
    },
  });
}
