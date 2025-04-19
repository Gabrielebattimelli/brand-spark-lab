-- Create a function to securely get assets for a specific project and user
CREATE OR REPLACE FUNCTION public.get_user_project_assets(
  p_project_id UUID,
  p_asset_type TEXT
)
RETURNS SETOF public.generated_assets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user has access to the project
  IF NOT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Project does not belong to the current user';
  END IF;

  -- Return the assets for the project and type
  RETURN QUERY
  SELECT ga.*
  FROM public.generated_assets ga
  WHERE ga.project_id = p_project_id
  AND ga.type = p_asset_type
  ORDER BY ga.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_project_assets(UUID, TEXT) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION public.get_user_project_assets IS 'Securely get assets for a specific project and user with proper authorization checks';