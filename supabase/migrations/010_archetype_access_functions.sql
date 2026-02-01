-- Migration: Create public schema functions to access ppt.persona_archetypes
-- This allows the REST API to access archetypes via RPC calls

-- Get all archetypes
CREATE OR REPLACE FUNCTION public.get_all_archetypes()
RETURNS SETOF ppt.persona_archetypes
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT * FROM ppt.persona_archetypes ORDER BY name;
$$;

-- Get archetype by ID
CREATE OR REPLACE FUNCTION public.get_archetype_by_id(archetype_id UUID)
RETURNS ppt.persona_archetypes
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT * FROM ppt.persona_archetypes WHERE id = archetype_id;
$$;

-- Get archetype by slug
CREATE OR REPLACE FUNCTION public.get_archetype_by_slug(archetype_slug TEXT)
RETURNS ppt.persona_archetypes
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT * FROM ppt.persona_archetypes WHERE slug = archetype_slug;
$$;

-- Get archetypes by category
CREATE OR REPLACE FUNCTION public.get_archetypes_by_category(cat TEXT)
RETURNS SETOF ppt.persona_archetypes
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT * FROM ppt.persona_archetypes WHERE category::TEXT = cat ORDER BY name;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_all_archetypes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_archetypes() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_id(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_slug(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetypes_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetypes_by_category(TEXT) TO service_role;

-- Comments
COMMENT ON FUNCTION public.get_all_archetypes() IS 'Get all persona archetypes';
COMMENT ON FUNCTION public.get_archetype_by_id(UUID) IS 'Get a persona archetype by its UUID';
COMMENT ON FUNCTION public.get_archetype_by_slug(TEXT) IS 'Get a persona archetype by its slug';
COMMENT ON FUNCTION public.get_archetypes_by_category(TEXT) IS 'Get all archetypes in a category';
