# Security Fix: Cross-Account Data Leakage

This patch addresses a critical security issue where users could see logos and brand names from other accounts and projects.

## Changes Made

1. Added proper Row Level Security (RLS) policies to the `generated_assets` table to ensure that users can only access assets that belong to their own projects.

2. Updated the `useGeneratedAssets` hook to include additional verification that the project belongs to the current user:
   - `getAsset` function now verifies project ownership
   - `getAssets` function now verifies project ownership
   - `getAllLogos` function now verifies project ownership

3. Updated the AIContext to include additional verification that the project belongs to the current user.

4. Added extensive logging to help diagnose any issues.

## How to Apply the Fix

1. Apply the RLS policies to your Supabase instance:

```bash
# Navigate to your project directory
cd /path/to/brand-spark-lab

# Apply the migration
supabase db push
```

2. Alternatively, you can manually execute the SQL in the Supabase SQL Editor:

```sql
-- Fix Row Level Security policies for generated_assets table

-- Enable RLS on the table if not already enabled
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS select_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS insert_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS update_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS delete_own_assets ON public.generated_assets;

-- Create policy to allow users to select only their own assets
-- (via the projects table relationship)
CREATE POLICY select_own_assets ON public.generated_assets
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to insert only assets for their own projects
CREATE POLICY insert_own_assets ON public.generated_assets
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to update only their own assets
CREATE POLICY update_own_assets ON public.generated_assets
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to delete only their own assets
CREATE POLICY delete_own_assets ON public.generated_assets
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Grant necessary privileges
GRANT ALL ON public.generated_assets TO authenticated;
```

## Verification

After applying the fix, you should:

1. Log in with different accounts and verify that each account only sees its own logos and brand names.
2. Create new projects and verify that assets are properly isolated between projects.
3. Check the browser console for any errors related to the `get_user_project_assets` function.

## Additional Security Recommendations

1. Review all database access patterns in the application to ensure proper authorization checks.
2. Consider implementing Row Level Security (RLS) policies for all tables if not already in place.
3. Add logging for security-related events to help detect and investigate potential issues.