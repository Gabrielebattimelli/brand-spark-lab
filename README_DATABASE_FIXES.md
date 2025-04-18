# Database Fixes

## Recent Fixes

### 1. Added Completion Percentage to Projects Table

Migration: `20250418135914_add_completion_percentage_to_projects.sql`

This migration adds a `completion_percentage` column to the projects table, which tracks the progress of each project as a percentage value (0-100). This allows for better visualization of project progress in the UI.

```sql
-- Add completion_percentage column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Update existing projects to have a default value
UPDATE projects SET completion_percentage = 0 WHERE completion_percentage IS NULL;
```

### 2. Fixed JSON Handling in Project Data Table

Migration: `20250418140000_fix_project_data_json_handling.sql`

This migration addresses 406 (Not Acceptable) errors that were occurring when accessing the `project_data` table. The issue was related to improper JSON handling in the data column.

The following fixes were implemented:

```sql
-- Ensure the data column has a default empty JSON object
ALTER TABLE project_data ALTER COLUMN data SET DEFAULT '{}'::jsonb;

-- Add a check constraint to ensure data is always valid JSON
ALTER TABLE project_data ADD CONSTRAINT project_data_valid_json CHECK (data IS NULL OR jsonb_typeof(data) = 'object');

-- Ensure step column has proper validation
ALTER TABLE project_data ADD CONSTRAINT project_data_valid_step CHECK (
  step IN ('basics', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'results')
);

-- Fix any existing NULL data values
UPDATE project_data SET data = '{}'::jsonb WHERE data IS NULL;
```

## How to Apply These Fixes

To apply these database migrations:

1. Ensure you have the Supabase CLI installed
2. Run the following command from your project root:

```bash
supabase db push
```

This will apply all pending migrations to your Supabase database.

## Troubleshooting

If you continue to experience 406 errors after applying these migrations, try the following:

1. Clear your browser cache and reload the application
2. Check the browser console for any specific error messages
3. Verify that the migrations were successfully applied by checking the Supabase dashboard
4. If problems persist, you may need to manually fix any corrupted data in the `project_data` table