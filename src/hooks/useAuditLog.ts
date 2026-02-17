import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface AuditLogEntry {
  action: "create" | "update" | "delete" | "view" | "export" | "approve" | "reject" | "submit";
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export function useAuditLog() {
  const { user, profile } = useAuth();

  const log = async (entry: AuditLogEntry) => {
    if (!user || !profile?.organization_id) return;

    await supabase.from("audit_logs").insert({
      organization_id: profile.organization_id,
      user_id: user.id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      changes: entry.changes as any,
    });
  };

  return { log };
}
