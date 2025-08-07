-- Add custom_fields column to participants table
ALTER TABLE participants ADD COLUMN custom_fields jsonb DEFAULT '{}';
