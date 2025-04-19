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