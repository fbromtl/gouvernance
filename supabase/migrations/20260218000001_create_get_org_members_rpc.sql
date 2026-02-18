-- get_org_members: returns all members of an organization with profile + email + role
-- SECURITY DEFINER to allow reading auth.users.email (not exposed to client otherwise)

CREATE OR REPLACE FUNCTION public.get_org_members(_org_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only super_admin / org_admin of this org can call
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.organization_id = _org_id
      AND ur.role IN ('super_admin', 'org_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    p.id                                          AS user_id,
    p.full_name::TEXT,
    p.avatar_url::TEXT,
    u.email::TEXT,
    COALESCE(ur.role, 'member')::TEXT             AS role,
    COALESCE(ur.created_at, p.created_at)         AS joined_at
  FROM profiles p
  INNER JOIN auth.users u ON u.id = p.id
  LEFT JOIN user_roles ur
    ON ur.user_id = p.id AND ur.organization_id = _org_id
  WHERE p.organization_id = _org_id
  ORDER BY COALESCE(ur.created_at, p.created_at) ASC;
END;
$$;
