import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  REQUIREMENTS_BY_FRAMEWORK,
  ALL_REQUIREMENTS,
  FRAMEWORK_CODES,
  computeGlobalScore,
  type FrameworkCode,
  type FrameworkScore,
} from "@/lib/compliance-frameworks";
import type {
  ComplianceAssessment,
  ComplianceAssessmentUpdate,
  RemediationAction,
  RemediationActionInsert,
  RemediationActionUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface AssessmentFilters {
  framework_code?: FrameworkCode;
}

export interface RemediationFilters {
  priority?: string;
  status?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES — Assessments                                              */
/* ------------------------------------------------------------------ */

export function useComplianceAssessments(filters?: AssessmentFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["compliance-assessments", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("compliance_assessments")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.framework_code) {
        query = query.eq("framework_code", filters.framework_code);
      }

      query = query.order("framework_code").order("requirement_code");

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ComplianceAssessment[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  QUERIES — Scores (computed client-side)                            */
/* ------------------------------------------------------------------ */

export function useComplianceScores() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["compliance-scores", orgId],
    queryFn: async () => {
      if (!orgId) return { frameworks: [] as FrameworkScore[], global: 0 };

      const { data, error } = await supabase
        .from("compliance_assessments")
        .select("framework_code, status")
        .eq("organization_id", orgId);

      if (error) throw error;

      const assessments = (data ?? []) as Pick<ComplianceAssessment, "framework_code" | "status">[];

      // Group by framework
      const frameworkScores: FrameworkScore[] = FRAMEWORK_CODES.map((fw) => {
        const fwAssessments = assessments.filter((a) => a.framework_code === fw);
        const total = REQUIREMENTS_BY_FRAMEWORK[fw].length;

        if (fwAssessments.length === 0) {
          return { framework: fw, score: 0, total, compliant: 0, partial: 0, nonCompliant: 0, notApplicable: 0 };
        }

        const compliant = fwAssessments.filter((a) => a.status === "compliant").length;
        const partial = fwAssessments.filter((a) => a.status === "partially_compliant").length;
        const nonCompliant = fwAssessments.filter((a) => a.status === "non_compliant").length;
        const notApplicable = fwAssessments.filter((a) => a.status === "not_applicable").length;
        const applicable = fwAssessments.length - notApplicable;
        const score = applicable > 0 ? Math.round(((compliant + partial * 0.5) / applicable) * 100) : 0;

        return { framework: fw, score, total, compliant, partial, nonCompliant, notApplicable };
      });

      const global = computeGlobalScore(frameworkScores.filter((f) => f.compliant + f.partial + f.nonCompliant + f.notApplicable > 0));

      return { frameworks: frameworkScores, global };
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  QUERIES — Remediation Actions                                      */
/* ------------------------------------------------------------------ */

export function useRemediationActions(filters?: RemediationFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["remediation-actions", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("remediation_actions")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      query = query.order("priority").order("due_date", { ascending: true, nullsFirst: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as RemediationAction[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Seed Framework                                         */
/* ------------------------------------------------------------------ */

export function useSeedFramework() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ frameworkCode }: { frameworkCode: FrameworkCode }) => {
      if (!user || !profile?.organization_id) throw new Error("Not authenticated");

      const requirements = REQUIREMENTS_BY_FRAMEWORK[frameworkCode];
      if (!requirements) throw new Error(`Unknown framework: ${frameworkCode}`);

      const records = requirements.map((req) => ({
        organization_id: profile.organization_id!,
        framework_code: frameworkCode,
        requirement_code: req.code,
        status: "non_compliant" as const,
        created_by: user.id,
        updated_by: user.id,
      }));

      const { data, error } = await supabase
        .from("compliance_assessments")
        .upsert(records, { onConflict: "organization_id,framework_code,requirement_code" })
        .select();

      if (error) throw error;
      return data as ComplianceAssessment[];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-scores"] });
      log({
        action: "create",
        resource_type: "compliance_assessment",
        changes: { framework: { old: null, new: variables.frameworkCode } },
      });
    },
  });
}

export function useSeedAllFrameworks() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async () => {
      if (!user || !profile?.organization_id) throw new Error("Not authenticated");

      const records = ALL_REQUIREMENTS.map((req) => ({
        organization_id: profile.organization_id!,
        framework_code: req.framework,
        requirement_code: req.code,
        status: "non_compliant" as const,
        created_by: user.id,
        updated_by: user.id,
      }));

      const { data, error } = await supabase
        .from("compliance_assessments")
        .upsert(records, { onConflict: "organization_id,framework_code,requirement_code" })
        .select();

      if (error) throw error;
      return data as ComplianceAssessment[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-scores"] });
      log({
        action: "create",
        resource_type: "compliance_assessment",
        changes: { framework: { old: null, new: "all" } },
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Update Assessment                                      */
/* ------------------------------------------------------------------ */

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: ComplianceAssessmentUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("compliance_assessments")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceAssessment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["compliance-scores"] });
      log({
        action: "update",
        resource_type: "compliance_assessment",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS — Remediation CRUD                                       */
/* ------------------------------------------------------------------ */

export function useCreateRemediation() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<RemediationActionInsert, "organization_id" | "created_by">
    ) => {
      if (!user || !profile?.organization_id) throw new Error("Not authenticated");

      const record = {
        ...input,
        organization_id: profile.organization_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await supabase
        .from("remediation_actions")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as RemediationAction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["remediation-actions"] });
      log({
        action: "create",
        resource_type: "remediation_action",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdateRemediation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: RemediationActionUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("remediation_actions")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as RemediationAction;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["remediation-actions"] });
      log({
        action: "update",
        resource_type: "remediation_action",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteRemediation() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("remediation_actions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["remediation-actions"] });
      log({
        action: "delete",
        resource_type: "remediation_action",
        resource_id: variables.id,
      });
    },
  });
}
