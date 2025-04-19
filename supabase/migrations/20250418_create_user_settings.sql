-- Create user_settings table to store API keys and other user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gemini_api_key TEXT,
  ideogram_api_key TEXT,
  clipdrop_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- Add RLS policies for security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to select only their own settings
DROP POLICY IF EXISTS select_own_settings ON public.user_settings;
CREATE POLICY select_own_settings ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert only their own settings
DROP POLICY IF EXISTS insert_own_settings ON public.user_settings;
CREATE POLICY insert_own_settings ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update only their own settings
DROP POLICY IF EXISTS update_own_settings ON public.user_settings;
CREATE POLICY update_own_settings ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Add function to automatically handle updates to updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_user_settings_modified
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Grant necessary privileges
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
