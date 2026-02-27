import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PublicDocument, Jurisdiction, DocumentCategory } from "@/types/public-documents";

/** Fetch all published documents for a jurisdiction, grouped by category */
export function usePublicDocuments(jurisdiction: Jurisdiction) {
  return useQuery({
    queryKey: ["public-documents", jurisdiction],
    queryFn: async (): Promise<DocumentCategory[]> => {
      const { data, error } = await supabase
        .from("public_documents")
        .select("*")
        .eq("jurisdiction", jurisdiction)
        .eq("is_published", true)
        .order("category_order", { ascending: true })
        .order("document_order", { ascending: true });

      if (error) throw error;

      // Group documents by category
      const categoryMap = new Map<string, DocumentCategory>();
      for (const doc of (data as PublicDocument[])) {
        if (!categoryMap.has(doc.category_slug)) {
          categoryMap.set(doc.category_slug, {
            slug: doc.category_slug,
            name: doc.category_name,
            description: doc.category_description,
            order: doc.category_order,
            documents: [],
          });
        }
        categoryMap.get(doc.category_slug)!.documents.push(doc);
      }

      return Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — this data rarely changes
  });
}
