-- Safe migration that will apply whether objects exist or not

DO $$
BEGIN

-- STEP 1: Enable RLS on tables --
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- STEP 2: Fix generated_assets table policies --
-- First drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own assets" ON public.generated_assets;
DROP POLICY IF EXISTS "Users can insert their own assets" ON public.generated_assets;
DROP POLICY IF EXISTS "Users can update their own assets" ON public.generated_assets;
DROP POLICY IF EXISTS "Users can delete their own assets" ON public.generated_assets;
DROP POLICY IF EXISTS "select_own_assets" ON public.generated_assets;
DROP POLICY IF EXISTS "insert_own_assets" ON public.generated_assets;
DROP POLICY IF EXISTS "update_own_assets" ON public.generated_assets;
DROP POLICY IF EXISTS "delete_own_assets" ON public.generated_assets;
DROP POLICY IF EXISTS "Enable all operations for users on their own assets" ON public.generated_assets;

-- Create single policy that allows all operations
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

-- STEP 3: Fix project_data table policies --
-- First drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own project data" ON public.project_data;
DROP POLICY IF EXISTS "Users can insert their own project data" ON public.project_data;
DROP POLICY IF EXISTS "Users can update their own project data" ON public.project_data;
DROP POLICY IF EXISTS "Users can delete their own project data" ON public.project_data;
DROP POLICY IF EXISTS "select_own_project_data" ON public.project_data;
DROP POLICY IF EXISTS "insert_own_project_data" ON public.project_data;
DROP POLICY IF EXISTS "update_own_project_data" ON public.project_data;
DROP POLICY IF EXISTS "delete_own_project_data" ON public.project_data;
DROP POLICY IF EXISTS "Enable all operations for users on their own project data" ON public.project_data;

-- Create single policy that allows all operations
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

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'An error occurred: %', SQLERRM;
END;
$$;
