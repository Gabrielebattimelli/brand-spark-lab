-- Define a function to safely get project step data
CREATE OR REPLACE FUNCTION get_project_step_data(p_project_id uuid, p_step text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Runs with the permissions of the function owner
AS $$
DECLARE
  result_data jsonb;
  requesting_user_id uuid := auth.uid(); -- Get the ID of the user making the request
  project_owner_id uuid;
BEGIN
  -- First, verify the project exists and belongs to the requesting user
  SELECT user_id INTO project_owner_id
  FROM public.projects
  WHERE id = p_project_id;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found: %', p_project_id;
  END IF;

  IF project_owner_id != requesting_user_id THEN
     RAISE EXCEPTION 'Access denied: User % does not own project %', requesting_user_id, p_project_id;
  END IF;

  -- Now, fetch the data for the specific step
  SELECT data INTO result_data
  FROM public.project_data
  WHERE project_id = p_project_id AND step = p_step;

  -- Return the data found, or NULL if no row exists for the step
  RETURN COALESCE(result_data, '{}'::jsonb); -- Return empty JSON if null

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details (optional, requires appropriate logging setup)
    -- RAISE NOTICE 'Error fetching project data for project %, step %: %', p_project_id, p_step, SQLERRM;
    -- Return null or empty JSON in case of any unexpected error during fetch
    RETURN '{}'::jsonb;
END;
$$;