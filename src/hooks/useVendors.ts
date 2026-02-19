import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type { Vendor, VendorInsert, VendorUpdate } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface VendorFilters {
  status?: string;
  risk_level?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useVendors(filters?: VendorFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["vendors", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("vendors")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.risk_level) {
        query = query.eq("risk_level", filters.risk_level);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,website.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`
        );
      }

      query = query.order("updated_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Vendor[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<VendorInsert, "organization_id" | "created_by">
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
        .from("vendors")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      log({
        action: "create",
        resource_type: "vendor",
        resource_id: data.id,
        changes: { name: { old: null, new: data.name } },
      });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: VendorUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("vendors")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      log({
        action: "update",
        resource_type: "vendor",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      log({
        action: "delete",
        resource_type: "vendor",
        resource_id: variables.id,
      });
    },
  });
}
