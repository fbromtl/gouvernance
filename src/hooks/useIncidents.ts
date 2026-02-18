import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Incident, IncidentInsert, IncidentUpdate } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface IncidentFilters {
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
  ai_system_id?: string;
}

/* ------------------------------------------------------------------ */
/*  LIST INCIDENTS                                                     */
/* ------------------------------------------------------------------ */

export function useIncidents(filters?: IncidentFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["incidents", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("incidents")
        .select("*")
        .eq("organization_id", orgId)
        .is("deleted_at", null);

      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data ?? []) as Incident[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  GET SINGLE INCIDENT                                                */
/* ------------------------------------------------------------------ */

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single() as any);

      if (error) throw error;
      return data as Incident;
    },
    enabled: !!id,
  });
}

/* ------------------------------------------------------------------ */
/*  CREATE INCIDENT                                                    */
/* ------------------------------------------------------------------ */

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<IncidentInsert, "organization_id" | "created_by" | "reported_by">) => {
      if (!user || !profile?.organization_id) {
        throw new Error("Not authenticated");
      }

      const record = {
        ...input,
        organization_id: profile.organization_id,
        reported_by: user.id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data, error } = await (supabase
        .from("incidents")
        .insert(record as any)
        .select()
        .single() as any);

      if (error) throw error;
      return data as Incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  UPDATE INCIDENT                                                    */
/* ------------------------------------------------------------------ */

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...input }: IncidentUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const record = {
        ...input,
        updated_by: user.id,
      };

      const { data, error } = await (supabase
        .from("incidents")
        .update(record as any)
        .eq("id", id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as Incident;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.id] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  SOFT DELETE INCIDENT                                               */
/* ------------------------------------------------------------------ */

export function useSoftDeleteIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase
        .from("incidents")
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user.id,
        } as any)
        .eq("id", id) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}
