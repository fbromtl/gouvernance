import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  LifecycleEvent,
  LifecycleEventInsert,
  LifecycleEventUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface LifecycleEventFilters {
  event_type?: string;
  ai_system_id?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useLifecycleEvents(filters?: LifecycleEventFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["lifecycleEvents", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("lifecycle_events")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.event_type) {
        query = query.eq("event_type", filters.event_type);
      }
      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      query = query.order("change_date", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as LifecycleEvent[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateLifecycleEvent() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<LifecycleEventInsert, "organization_id" | "created_by">
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
        .from("lifecycle_events")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as LifecycleEvent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lifecycleEvents"] });
      log({
        action: "create",
        resource_type: "lifecycle_event",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdateLifecycleEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: LifecycleEventUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lifecycle_events")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as LifecycleEvent;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lifecycleEvents"] });
      log({
        action: "update",
        resource_type: "lifecycle_event",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteLifecycleEvent() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("lifecycle_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lifecycleEvents"] });
      log({
        action: "delete",
        resource_type: "lifecycle_event",
        resource_id: variables.id,
      });
    },
  });
}
