-- Migration: Add raw_analysis column to test_results for storing detailed analysis data
-- Used for headline tests and other specialized test types

ALTER TABLE ppt.test_results
ADD COLUMN IF NOT EXISTS raw_analysis JSONB DEFAULT '{}';

COMMENT ON COLUMN ppt.test_results.raw_analysis IS 'Raw analysis data including headline rankings, segment insights, etc.';
