import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import type { MemberProfile } from "@/components/shared/MemberCard";
import type { PlanId } from "@/lib/stripe";

/**
 * Fetches all members who have a member_slug (public profile enabled).
 * Joins profiles -> organizations -> subscriptions to get plan level.
 */
export function useMembers() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<MemberProfile[]> => {
      // Get profiles that have a member_slug (opted into the directory)
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          job_title,
          bio,
          linkedin_url,
          member_slug,
          organization_id
        `)
        .not("member_slug", "is", null);

      if (error) throw error;
      if (!profiles || profiles.length === 0) return [];

      // Get org names and subscription plans for each member
      const orgIds = [...new Set(profiles.map((p) => p.organization_id).filter(Boolean))] as string[];

      const [orgsResult, subsResult] = await Promise.all([
        orgIds.length > 0
          ? supabase.from("organizations").select("id, name").in("id", orgIds)
          : { data: [], error: null },
        orgIds.length > 0
          ? supabase.from("subscriptions").select("organization_id, plan").in("organization_id", orgIds)
          : { data: [], error: null },
      ]);

      const orgMap = new Map((orgsResult.data ?? []).map((o: any) => [o.id, o.name]));
      const planMap = new Map(
        (subsResult.data ?? []).map((s: any) => [s.organization_id, s.plan as PlanId])
      );

      return profiles.map((p) => ({
        id: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        job_title: p.job_title,
        bio: p.bio,
        linkedin_url: p.linkedin_url,
        member_slug: p.member_slug,
        organization_name: p.organization_id ? orgMap.get(p.organization_id) ?? null : null,
        plan: p.organization_id ? planMap.get(p.organization_id) ?? "observer" : "observer",
      }));
    },
    enabled: !!profile,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single member by slug (for public profile page, no auth required) */
export function useMemberBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["member", slug],
    queryFn: async (): Promise<MemberProfile | null> => {
      if (!slug) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          job_title,
          bio,
          linkedin_url,
          member_slug,
          organization_id
        `)
        .eq("member_slug", slug)
        .single();

      if (error || !profile) return null;

      let orgName: string | null = null;
      let plan: PlanId = "observer";

      if (profile.organization_id) {
        const [orgRes, subRes] = await Promise.all([
          supabase.from("organizations").select("name").eq("id", profile.organization_id).single(),
          supabase.from("subscriptions").select("plan").eq("organization_id", profile.organization_id).single(),
        ]);
        orgName = orgRes.data?.name ?? null;
        plan = (subRes.data?.plan as PlanId) ?? "observer";
      }

      return {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        job_title: profile.job_title,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        member_slug: profile.member_slug,
        organization_name: orgName,
        plan,
      };
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}
