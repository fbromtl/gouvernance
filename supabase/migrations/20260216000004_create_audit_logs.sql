-- ============================================
-- Migration: Create audit_logs table
-- Immutable audit trail for all actions
-- ============================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN (
    'create', 'update', 'delete', 'view', 'export',
    'approve', 'reject', 'submit', 'login', 'logout'
  )),
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for frequent queries
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authorized roles can read audit logs
CREATE POLICY "select_audit_logs_authorized" ON public.audit_logs
  FOR SELECT USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (auth.jwt() ->> 'role') IN ('super_admin', 'org_admin', 'compliance_officer', 'auditor')
  );

-- Any authenticated user in the org can insert (for logging their own actions)
CREATE POLICY "insert_audit_logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
  );

-- Audit logs are NEVER modifiable or deletable
-- (no UPDATE or DELETE policies = forbidden)
