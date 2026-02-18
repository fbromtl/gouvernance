-- ============================================
-- Migration: JWT custom claims hook
-- Injects organization_id and role into JWT
-- ============================================
-- IMPORTANT: After applying this migration, enable the hook in
-- Supabase Dashboard > Authentication > Hooks > Custom Access Token
-- Select function: custom_access_token_hook

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  user_org_id uuid;
  user_role text;
BEGIN
  claims := event -> 'claims';

  -- Get organization_id and role from user_roles
  SELECT ur.organization_id, ur.role
  INTO user_org_id, user_role
  FROM public.user_roles ur
  WHERE ur.user_id = (event ->> 'user_id')::uuid
  LIMIT 1;

  -- Inject into claims
  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(user_org_id::text));
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant supabase_auth_admin permission to call this function and read user_roles
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.user_roles TO supabase_auth_admin;

-- Revoke from regular users (only auth system should call this)
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
