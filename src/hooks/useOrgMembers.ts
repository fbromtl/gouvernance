import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface OrgMember {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  role: string;
  joined_at: string;
}

export function useOrgMembers() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["org-members", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_org_members", {
        _org_id: orgId!,
      });
      if (error) throw error;
      return data as OrgMember[];
    },
    enabled: !!orgId,
  });
}
