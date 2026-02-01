-- Migration: Add personality_core to archetypes and create phantom_traits table
-- This enables the two-layer prompt architecture with emotional depth

-- Add personality_core column to archetypes
ALTER TABLE ppt.persona_archetypes
ADD COLUMN IF NOT EXISTS personality_core JSONB DEFAULT '{}';

-- Create phantom traits table
CREATE TABLE IF NOT EXISTS ppt.persona_phantom_traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES ppt.persona_archetypes(id) ON DELETE CASCADE,

  shorthand VARCHAR(100) NOT NULL,
  trait_key VARCHAR(100) NOT NULL,

  word_triggers TEXT[] NOT NULL DEFAULT '{}',
  claim_triggers TEXT[] NOT NULL DEFAULT '{}',
  emotional_contexts TEXT[] NOT NULL DEFAULT '{}',

  feeling_seed TEXT NOT NULL,
  phantom_story TEXT NOT NULL,
  influence VARCHAR(100) NOT NULL,

  weight DECIMAL(4,2) NOT NULL DEFAULT 3.0,
  activation_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.5,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(archetype_id, trait_key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_phantom_traits_archetype
ON ppt.persona_phantom_traits(archetype_id);

-- RPC function to get traits for an archetype (accessible via REST API)
CREATE OR REPLACE FUNCTION public.get_archetype_traits(arch_slug TEXT)
RETURNS SETOF JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ppt, public
STABLE
AS $$
  SELECT to_jsonb(t.*)
  FROM ppt.persona_phantom_traits t
  JOIN ppt.persona_archetypes a ON t.archetype_id = a.id
  WHERE a.slug = arch_slug
  ORDER BY t.weight DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_archetype_traits(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_archetype_traits(TEXT) TO service_role;

COMMENT ON TABLE ppt.persona_phantom_traits IS 'Phantom traits that activate based on stimulus content to create emotional depth';
COMMENT ON FUNCTION public.get_archetype_traits(TEXT) IS 'Get all phantom traits for an archetype by slug';
