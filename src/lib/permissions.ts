export const ROLES = [
  'super_admin', 'org_admin', 'compliance_officer', 'risk_manager',
  'data_scientist', 'ethics_officer', 'auditor', 'member',
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  manage_organization:   ['super_admin', 'org_admin'],
  manage_users:          ['super_admin', 'org_admin'],
  create_ai_system:      ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  edit_ai_system:        ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  view_ai_systems:       ROLES as unknown as string[],
  assess_risks:          ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
  manage_incidents:      ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'data_scientist', 'ethics_officer'],
  report_incident:       ROLES as unknown as string[],
  manage_bias:           ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'data_scientist', 'ethics_officer'],
  approve_decisions:     ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager', 'ethics_officer'],
  manage_compliance:     ['super_admin', 'org_admin', 'compliance_officer'],
  export_data:           ['super_admin', 'org_admin', 'compliance_officer', 'auditor'],
  view_audit_trail:      ['super_admin', 'org_admin', 'compliance_officer', 'auditor'],
  configure_monitoring:  ['super_admin', 'org_admin', 'risk_manager', 'data_scientist'],
  manage_policies:       ['super_admin', 'org_admin', 'compliance_officer', 'ethics_officer'],
  manage_vendors:        ['super_admin', 'org_admin', 'compliance_officer', 'risk_manager'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  const allowed = PERMISSIONS[permission];
  return (allowed as readonly string[]).includes(role);
}
