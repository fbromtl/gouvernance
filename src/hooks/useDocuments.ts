import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  GovDocument,
  GovDocumentInsert,
  GovDocumentUpdate,
} from "@/types/database";

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface DocumentFilters {
  document_type?: string;
  status?: string;
  ai_system_id?: string;
  search?: string;
}

/* ------------------------------------------------------------------ */
/*  QUERIES                                                            */
/* ------------------------------------------------------------------ */

export function useDocuments(filters?: DocumentFilters) {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["documents", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from("documents")
        .select("*")
        .eq("organization_id", orgId);

      if (filters?.document_type) {
        query = query.eq("document_type", filters.document_type);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.ai_system_id) {
        query = query.eq("ai_system_id", filters.ai_system_id);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as GovDocument[];
    },
    enabled: !!orgId,
  });
}

/* ------------------------------------------------------------------ */
/*  MUTATIONS                                                          */
/* ------------------------------------------------------------------ */

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (
      input: Omit<GovDocumentInsert, "organization_id" | "created_by">
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
        .from("documents")
        .insert(record as any)
        .select()
        .single();

      if (error) throw error;
      return data as GovDocument;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      log({
        action: "create",
        resource_type: "document",
        resource_id: data.id,
        changes: { title: { old: null, new: data.title } },
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: GovDocumentUpdate & { id: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("documents")
        .update({ ...input, updated_by: user.id } as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as GovDocument;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      log({
        action: "update",
        resource_type: "document",
        resource_id: variables.id,
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      log({
        action: "delete",
        resource_type: "document",
        resource_id: variables.id,
      });
    },
  });
}
