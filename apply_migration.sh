#!/bin/bash

# Apply the migration to create the get_user_project_assets function
echo "Applying migration to create get_user_project_assets function..."
supabase functions deploy get_user_project_assets

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Failed to apply migration."
fi