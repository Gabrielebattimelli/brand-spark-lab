-- Add brand-name-generator step to project_data table

-- First, drop the existing constraint
ALTER TABLE project_data DROP CONSTRAINT project_data_valid_step;

-- Add the updated constraint with the new step
ALTER TABLE project_data ADD CONSTRAINT project_data_valid_step CHECK (
  step IN ('basics', 'brand-name-generator', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'results')
); 