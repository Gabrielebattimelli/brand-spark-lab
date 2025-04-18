-- Add completion_percentage column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Update existing projects to have a default value
UPDATE projects SET completion_percentage = 0 WHERE completion_percentage IS NULL;