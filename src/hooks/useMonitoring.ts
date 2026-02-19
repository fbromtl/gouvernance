import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  MonitoringMetric,
  MonitoringMetricInsert,
  MonitoringMetricUpdate,
  MonitoringDataPoint,
  MonitoringDataPointInsert,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface MonitoringMetricFilters {
  category?: string;
  ai_system_id?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useMonitoringMetrics(filters?: MonitoringMetricFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["monitoringMetrics", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("monitoring_metrics")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%`
        );
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MonitoringMetric[];
    },
    enabled: !!orgId,
  });
}

export function useMonitoringDataPoints(metricId: string | null) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["monitoringDataPoints", orgId, metricId],
    queryFn: async () => {
      if (!orgId || !metricId) return [];

      const { data, error } = await supabase
        .from("monitoring_data_points")
        .select("*")
        .eq("organization_id", orgId)
        .eq("metric_id", metricId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as MonitoringDataPoint[];
    },
    enabled: !!orgId && !!metricId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateMonitoringMetric() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<MonitoringMetricInsert, "organization_id" | "created_by">
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
        .from("monitoring_metrics")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as MonitoringMetric;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["monitoringMetrics"] });
      log({
        action: "create",
        resource_type: "monitoring_metric",
        resource_id: data.id,
        changes: { name: { old: null, new: data.name } },
      });
    },
  });
}

export function useUpdateMonitoringMetric() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: MonitoringMetricUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("monitoring_metrics")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MonitoringMetric;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["monitoringMetrics"] });
      log({
        action: "update",
        resource_type: "monitoring_metric",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteMonitoringMetric() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("monitoring_metrics")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["monitoringMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["monitoringDataPoints"] });
      log({
        action: "delete",
        resource_type: "monitoring_metric",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  ADD DATA POINT (with auto alert_level calculation)                 */
/* ------------------------------------------------------------------ */

function calculateAlertLevel(
  value: number,
  metric: MonitoringMetric
): "ok" | "warning" | "critical" {
  const { direction, warning_threshold, critical_threshold, acceptable_min, acceptable_max } = metric;

  if (direction === "higher_is_better") {
    // Higher is better: critical if value drops below critical, warning if below warning
    if (critical_threshold != null && value <= critical_threshold) return "critical";
    if (warning_threshold != null && value <= warning_threshold) return "warning";
    return "ok";
  }

  if (direction === "lower_is_better") {
    // Lower is better: critical if value exceeds critical, warning if exceeds warning
    if (critical_threshold != null && value >= critical_threshold) return "critical";
    if (warning_threshold != null && value >= warning_threshold) return "warning";
    return "ok";
  }

  if (direction === "target_range") {
    // Target range: check if value is within acceptable bounds
    if (acceptable_min != null && acceptable_max != null) {
      if (value < acceptable_min || value > acceptable_max) {
        // Outside range - check how far
        if (critical_threshold != null) {
          const minDist = acceptable_min != null ? acceptable_min - value : 0;
          const maxDist = acceptable_max != null ? value - acceptable_max : 0;
          const dist = Math.max(minDist, maxDist);
          if (dist >= critical_threshold) return "critical";
        }
        return "warning";
      }
    }
    return "ok";
  }

  return "ok";
}

export function useAddDataPoint() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<MonitoringDataPointInsert, "organization_id" | "created_by" | "alert_level">
    ) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      // Fetch the metric to get thresholds
      const { data: metric, error: metricError } = await supabase
        .from("monitoring_metrics")
        .select("*")
        .eq("id", input.metric_id)
        .single();

      if (metricError) throw metricError;

      const alertLevel = calculateAlertLevel(
        Number(input.value),
        metric as MonitoringMetric
      );

      const record = {
        ...input,
        organization_id: profile.organization_id,
        created_by: user.id,
        alert_level: alertLevel,
      };

      const { data, error } = await supabase
        .from("monitoring_data_points")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as MonitoringDataPoint;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["monitoringDataPoints"] });
      log({
        action: "create",
        resource_type: "monitoring_data_point",
        resource_id: data.id,
      });
    },
  });
}
