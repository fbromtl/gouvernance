-- RPC function to create an organization and assign the creator as org_admin
-- This bypasses RLS since it runs as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.onboard_create_organization(
  p_name TEXT,
  p_sector TEXT DEFAULT NULL,
  p_size TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check user doesn't already have an organization
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND organization_id IS NOT NULL) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  -- Generate a slug from the name
  v_slug := lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(v_slug, '-');

  -- Ensure slug uniqueness
  IF EXISTS (SELECT 1 FROM organizations WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  -- 1. Create the organization
  INSERT INTO organizations (name, slug, sector, size, country, province, plan)
  VALUES (p_name, v_slug, p_sector, p_size, p_country, p_province, 'starter')
  RETURNING id INTO v_org_id;

  -- 2. Create user_role as org_admin
  INSERT INTO user_roles (user_id, organization_id, role)
  VALUES (v_user_id, v_org_id, 'org_admin');

  -- 3. Update profile with organization_id
  UPDATE profiles
  SET organization_id = v_org_id
  WHERE id = v_user_id;

  -- 4. Log the action
  INSERT INTO audit_logs (action, resource_type, resource_id, changes, organization_id, user_id)
  VALUES (
    'create',
    'organization',
    v_org_id,
    jsonb_build_object('name', p_name, 'created_via', 'onboarding'),
    v_org_id,
    v_user_id
  );

  RETURN v_org_id;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.onboard_create_organization TO authenticated;
