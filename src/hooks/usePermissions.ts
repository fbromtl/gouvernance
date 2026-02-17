import { useCurrentRole } from "./useCurrentRole";
import { hasPermission, type Permission } from "@/lib/permissions";

export function usePermissions() {
  const { data: role } = useCurrentRole();

  return {
    role,
    can: (permission: Permission) => hasPermission(role ?? null, permission),
  };
}
