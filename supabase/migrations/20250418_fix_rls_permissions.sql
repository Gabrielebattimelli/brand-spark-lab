-- Fix Row Level Security policies for both project_data and generated_assets tables

-----------------------------------------------
-- First, ensure RLS is enabled on both tables
-----------------------------------------------

ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-----------------------------------------------
-- Fix generated_assets policies
-----------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS select_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS insert_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS update_own_assets ON public.generated_assets;
DROP POLICY IF EXISTS delete_own_assets ON public.generated_assets;

-- Create simplified policies for generated_assets table
DROP POLICY IF EXISTS "Users can view their own assets" ON public.generated_assets;
CREATE POLICY "Users can view their own assets" ON public.generated_assets
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own assets" ON public.generated_assets;
CREATE POLICY "Users can insert their own assets" ON public.generated_assets
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own assets" ON public.generated_assets;
CREATE POLICY "Users can update their own assets" ON public.generated_assets
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own assets" ON public.generated_assets;
CREATE POLICY "Users can delete their own assets" ON public.generated_assets
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generated_assets.project_id
            AND projects.user_id = auth.uid()
        )
    );

-----------------------------------------------
-- Fix project_data policies
-----------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS select_own_project_data ON public.project_data;
DROP POLICY IF EXISTS insert_own_project_data ON public.project_data;
DROP POLICY IF EXISTS update_own_project_data ON public.project_data;
DROP POLICY IF EXISTS delete_own_project_data ON public.project_data;

-- Create policies for project_data table
DROP POLICY IF EXISTS "Users can view their own project data" ON public.project_data;
CREATE POLICY "Users can view their own project data" ON public.project_data
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own project data" ON public.project_data;
CREATE POLICY "Users can insert their own project data" ON public.project_data
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own project data" ON public.project_data;
CREATE POLICY "Users can update their own project data" ON public.project_data
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own project data" ON public.project_data;
CREATE POLICY "Users can delete their own project data" ON public.project_data
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );
