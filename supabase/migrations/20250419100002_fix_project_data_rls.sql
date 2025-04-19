-- Fix Row Level Security policies for project_data table

-- Enable RLS on the table if not already enabled
ALTER TABLE public.project_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own project data
DROP POLICY IF EXISTS select_own_project_data ON public.project_data;
CREATE POLICY select_own_project_data ON public.project_data
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to insert only project data for their own projects
DROP POLICY IF EXISTS insert_own_project_data ON public.project_data;
CREATE POLICY insert_own_project_data ON public.project_data
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to update only their own project data
DROP POLICY IF EXISTS update_own_project_data ON public.project_data;
CREATE POLICY update_own_project_data ON public.project_data
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create policy to allow users to delete only their own project data
DROP POLICY IF EXISTS delete_own_project_data ON public.project_data;
CREATE POLICY delete_own_project_data ON public.project_data
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_data.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Grant necessary privileges
GRANT ALL ON public.project_data TO authenticated;
