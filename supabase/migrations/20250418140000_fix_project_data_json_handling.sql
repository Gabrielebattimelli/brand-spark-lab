-- Fix project_data table JSON handling

-- Ensure the data column has a default empty JSON object
ALTER TABLE project_data ALTER COLUMN data SET DEFAULT '{}'::jsonb;

-- Add a check constraint to ensure data is always valid JSON
ALTER TABLE project_data ADD CONSTRAINT project_data_valid_json CHECK (data IS NULL OR jsonb_typeof(data) = 'object');

-- Ensure step column has proper validation
ALTER TABLE project_data ADD CONSTRAINT project_data_valid_step CHECK (
  step IN ('basics', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'results')
);

-- Fix any existing NULL data values
UPDATE project_data SET data = '{}'::jsonb WHERE data IS NULL;