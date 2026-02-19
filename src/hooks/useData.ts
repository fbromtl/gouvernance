import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  Dataset,
  DatasetInsert,
  DatasetUpdate,
  DataTransfer,
  DataTransferInsert,
  DataTransferUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface DatasetFilters {
  source?: string;
  classification?: string;
  status?: string;
  search?: string;
}

export interface DataTransferFilters {
  dataset_id?: string;
  status?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  DATASETS - QUERIES                                                 */
/* ------------------------------------------------------------------ */

export function useDatasets(filters?: DatasetFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["datasets", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("datasets")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.source) {
        query = query.eq("source", filters.source);
      }
      if (filters?.classification) {
        query = query.eq("classification", filters.classification);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Dataset[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  DATASETS - MUTATIONS                                               */
/* ------------------------------------------------------------------ */

export function useCreateDataset() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<DatasetInsert, "organization_id" | "created_by">
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
        .from("datasets")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as Dataset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      log({
        action: "create",
        resource_type: "dataset",
        resource_id: data.id,
        changes: { name: { old: null, new: data.name } },
      });
    },
  });
}

export function useUpdateDataset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: DatasetUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("datasets")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Dataset;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      log({
        action: "update",
        resource_type: "dataset",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("datasets")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      log({
        action: "delete",
        resource_type: "dataset",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  DATA TRANSFERS - QUERIES                                           */
/* ------------------------------------------------------------------ */

export function useDataTransfers(filters?: DataTransferFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["dataTransfers", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("data_transfers")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.dataset_id) {
        query = query.eq("dataset_id", filters.dataset_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.or(
          `destination_country.ilike.%${filters.search}%,transfer_purpose.ilike.%${filters.search}%,destination_entity.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as DataTransfer[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  DATA TRANSFERS - MUTATIONS                                         */
/* ------------------------------------------------------------------ */

export function useCreateDataTransfer() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<DataTransferInsert, "organization_id" | "created_by">
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
        .from("data_transfers")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as DataTransfer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dataTransfers"] });
      log({
        action: "create",
        resource_type: "data_transfer",
        resource_id: data.id,
      });
    },
  });
}

export function useUpdateDataTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: DataTransferUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("data_transfers")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DataTransfer;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dataTransfers"] });
      log({
        action: "update",
        resource_type: "data_transfer",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteDataTransfer() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("data_transfers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dataTransfers"] });
      log({
        action: "delete",
        resource_type: "data_transfer",
        resource_id: variables.id,
      });
    },
  });
}
