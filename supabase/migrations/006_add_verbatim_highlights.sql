-- Migration: Add verbatim_highlights column to test_results
-- Stores direct quotes from phantom panel members for reporting

ALTER TABLE ppt.test_results
ADD COLUMN IF NOT EXISTS verbatim_highlights JSONB DEFAULT '[]';

COMMENT ON COLUMN ppt.test_results.verbatim_highlights IS 'Representative direct quotes from panel members during analysis';

