-- Migration: Fix archetype access functions to return JSONB instead of ppt schema types
-- This avoids the schema reference issue in the REST API

-- Drop old functions
DROP FUNCTION IF EXISTS public.get_all_archetypes();
DROP FUNCTION IF EXISTS public.get_archetype_by_id(UUID);
DROP FUNCTION IF EXISTS public.get_archetype_by_slug(TEXT);
DROP FUNCTION IF EXISTS public.get_archetypes_by_category(TEXT);

-- Get all archetypes - returns JSONB array
CREATE OR REPLACE FUNCTION public.get_all_archetypes()
RETURNS SETOF JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT to_jsonb(pa.*) FROM ppt.persona_archetypes pa ORDER BY pa.name;
$$;

-- Get archetype by ID - returns single JSONB
CREATE OR REPLACE FUNCTION public.get_archetype_by_id(archetype_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT to_jsonb(pa.*) FROM ppt.persona_archetypes pa WHERE pa.id = archetype_id;
$$;

-- Get archetype by slug - returns single JSONB
CREATE OR REPLACE FUNCTION public.get_archetype_by_slug(archetype_slug TEXT)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT to_jsonb(pa.*) FROM ppt.persona_archetypes pa WHERE pa.slug = archetype_slug;
$$;

-- Get archetypes by category - returns JSONB array
CREATE OR REPLACE FUNCTION public.get_archetypes_by_category(cat TEXT)
RETURNS SETOF JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT to_jsonb(pa.*) FROM ppt.persona_archetypes pa WHERE pa.category::TEXT = cat ORDER BY pa.name;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_all_archetypes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_archetypes() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_id(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetype_by_slug(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_archetypes_by_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetypes_by_category(TEXT) TO service_role;
