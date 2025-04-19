-- Simple SQL script to fix the 406 Not Acceptable errors
-- Run this directly in the Supabase SQL Editor

-- Enable RLS on tables
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- Drop and create a single policy for generated_assets
DROP POLICY IF EXISTS "Enable all operations for users on their own assets" ON public.generated_assets;
CREATE POLICY "Enable all operations for users on their own assets" ON public.generated_assets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Drop and create a single policy for project_data
DROP POLICY IF EXISTS "Enable all operations for users on their own project data" ON public.project_data;
CREATE POLICY "Enable all operations for users on their own project data" ON public.project_data
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );
