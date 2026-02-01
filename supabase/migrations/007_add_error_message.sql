-- Migration 007: Add error_message column to pressure_tests
-- Allows storing error details when tests fail

ALTER TABLE ppt.pressure_tests
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add comment for documentation
COMMENT ON COLUMN ppt.pressure_tests.error_message IS 'Stores error details when test status is failed';
