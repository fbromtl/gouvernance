import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

export function useCurrentRole() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id, profile?.organization_id],
    queryFn: async () => {
      if (!user || !profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", profile.organization_id)
        .single();
      if (error) return "member" as Role;
      return (data as any).role as Role;
    },
    enabled: !!user && !!profile?.organization_id,
  });
}
