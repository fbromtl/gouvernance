import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Resolves a list of user UUIDs to display names.
 * Returns a Map<userId, fullName>.
 *
 * Skips null/undefined entries. Only queries when there is at least one id.
 */
export function useUserNames(userIds: (string | null | undefined)[]) {
  const ids = userIds.filter((id): id is string => !!id);
  const uniqueIds = [...new Set(ids)];

  return useQuery({
    queryKey: ["user-names", uniqueIds],
    queryFn: async () => {
      if (uniqueIds.length === 0) return new Map<string, string>();

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", uniqueIds);

      if (error) throw error;

      const map = new Map<string, string>();
      for (const row of data ?? []) {
        map.set(row.id, row.full_name ?? row.id);
      }
      return map;
    },
    enabled: uniqueIds.length > 0,
    staleTime: 5 * 60 * 1000, // cache 5 min
  });
}
