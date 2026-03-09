import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface SavedArticle {
  id: string;
  organization_id: string;
  saved_by: string;
  article_link: string;
  title: string;
  source: string | null;
  snippet: string | null;
  pub_date: string | null;
  jurisdiction: string | null;
  ai_summary: string | null;
  notes: string;
  is_favorite: boolean;
  shared_to_org: boolean;
  status: "unread" | "read" | "archived";
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/* ---- List saved articles (own + org-shared) ---- */

export function useSavedArticles() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["saved-articles", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      // TODO: add saved_articles to Database types to remove this cast
      const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from("saved_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedArticle[];
    },
    enabled: !!orgId,
  });
}

/* ---- Save an article ---- */

export function useSaveArticle() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      article_link: string;
      title: string;
      source?: string;
      snippet?: string;
      pub_date?: string;
      jurisdiction?: string;
      ai_summary?: string;
      is_favorite?: boolean;
      shared_to_org?: boolean;
    }) => {
      if (!user || !profile?.organization_id)
        throw new Error("Not authenticated");

      // TODO: add saved_articles to Database types to remove this cast
      const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from("saved_articles")
        .upsert(
          {
            ...input,
            organization_id: profile.organization_id,
            saved_by: user.id,
          },
          { onConflict: "saved_by,article_link" }
        )
        .select()
        .single();

      if (error) throw error;
      return data as SavedArticle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}

/* ---- Update a saved article (notes, status, assigned_to, etc.) ---- */

export function useUpdateSavedArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<SavedArticle> & { id: string }) => {
      // TODO: add saved_articles to Database types to remove this cast
      const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from("saved_articles")
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SavedArticle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}

/* ---- Delete a saved article ---- */

export function useDeleteSavedArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: add saved_articles to Database types to remove this cast
      const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .from("saved_articles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-articles"] });
    },
  });
}
