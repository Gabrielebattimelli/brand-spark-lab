#!/bin/bash

# Apply the RLS policies to the generated_assets table
echo "Applying RLS policies to the generated_assets table..."

# Use the Supabase CLI to apply the migration
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "RLS policies applied successfully!"
else
  echo "Failed to apply RLS policies."
fi