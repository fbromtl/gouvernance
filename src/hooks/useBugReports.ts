import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface BugReportInsert {
  title: string;
  description: string;
  page_url?: string;
  severity: "blocking" | "annoying" | "minor";
  screenshot?: File;
}

export function useCreateBugReport() {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ screenshot, ...input }: BugReportInsert) => {
      if (!user || !profile?.organization_id) {
        throw new Error("Not authenticated");
      }

      const record = {
        ...input,
        organization_id: profile.organization_id,
        user_id: user.id,
      };

      // 1. Insert bug report
      const { data, error } = await (supabase as any)
        .from("bug_reports")
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      // 2. Upload screenshot if provided
      if (screenshot && data) {
        const path = `${profile.organization_id}/${data.id}/${screenshot.name}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-screenshots")
          .upload(path, screenshot);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("bug-screenshots")
            .getPublicUrl(path);

          await (supabase as any)
            .from("bug_reports")
            .update({ screenshot_url: urlData.publicUrl })
            .eq("id", data.id);
        }
        // If upload fails, warn user
        if (uploadError) {
          const { toast } = await import("sonner");
          toast.warning("La capture d'écran n'a pas pu être jointe au rapport.");
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug_reports"] });
    },
  });
}
