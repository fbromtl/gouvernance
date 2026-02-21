import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useAuditLog } from "@/hooks/useAuditLog";
import type {
  GovDocument,
  GovDocumentInsert,
  GovDocumentUpdate,
} from "@/types/database";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/* ------------------------------------------------------------------ */
/*  FILTERS                                                            */
/* ------------------------------------------------------------------ */

export interface DocumentFilters {
  document_type?: string;
  status?: string;
  ai_system_id?: string;
  category?: string;
  subcategory?: string;
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
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.subcategory) {
        query = query.eq("subcategory", filters.subcategory);
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

/** Get document counts grouped by category */
export function useDocumentCounts() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["document-counts", orgId],
    queryFn: async () => {
      if (!orgId) return {};

      const { data, error } = await supabase
        .from("documents")
        .select("category, subcategory")
        .eq("organization_id", orgId);

      if (error) throw error;

      const counts: Record<string, number> = { __all__: data?.length ?? 0 };
      for (const row of data ?? []) {
        const cat = row.category ?? "__uncategorized__";
        counts[cat] = (counts[cat] ?? 0) + 1;
        if (row.subcategory) {
          const subKey = `${cat}/${row.subcategory}`;
          counts[subKey] = (counts[subKey] ?? 0) + 1;
        }
      }
      // Count uncategorized
      counts["__uncategorized__"] = (data ?? []).filter((r) => !r.category).length;
      return counts;
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
      queryClient.invalidateQueries({ queryKey: ["document-counts"] });
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
      queryClient.invalidateQueries({ queryKey: ["document-counts"] });
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
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string }) => {
      // Delete the file from storage if path is provided
      if (storagePath) {
        await supabase.storage.from("documents").remove([storagePath]);
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-counts"] });
      log({
        action: "delete",
        resource_type: "document",
        resource_id: variables.id,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  FILE UPLOAD                                                        */
/* ------------------------------------------------------------------ */

export interface UploadResult {
  document: GovDocument;
  storagePath: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useAuditLog();

  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      const orgId = profile.organization_id;

      // 1. Create a document record first (status = processing)
      const { data: doc, error: insertError } = await supabase
        .from("documents")
        .insert({
          organization_id: orgId,
          title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
          document_type: "manual_upload",
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          status: "draft",
          tags: [],
          created_by: user.id,
          updated_by: user.id,
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Upload the file to Supabase Storage
      const storagePath = `${orgId}/${doc.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        // Clean up the document record
        await supabase.from("documents").delete().eq("id", doc.id);
        throw uploadError;
      }

      // 3. Update the document with the file URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);

      const { data: updated, error: updateError } = await supabase
        .from("documents")
        .update({ file_url: publicUrl } as any)
        .eq("id", doc.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return {
        document: updated as GovDocument,
        storagePath,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-counts"] });
      log({
        action: "create",
        resource_type: "document",
        resource_id: result.document.id,
        changes: { title: { old: null, new: result.document.title } },
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  AI ANALYSIS                                                        */
/* ------------------------------------------------------------------ */

export interface AiAnalysisResult {
  title: string;
  summary: string;
  category: string;
  subcategory: string;
  tags: string[];
  confidence: number;
}

export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: async ({
      storagePath,
      fileName,
      mimeType,
      language,
    }: {
      storagePath: string;
      fileName: string;
      mimeType: string;
      language?: string;
    }): Promise<AiAnalysisResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Not authenticated");

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analyze-document`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ storagePath, fileName, mimeType, language }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error("Analysis error:", err);
        throw new Error("Analysis failed");
      }

      return response.json();
    },
  });
}
