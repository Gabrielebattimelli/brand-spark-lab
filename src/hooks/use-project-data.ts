import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type StepType = 'basics' | 'brand-name-generator' | 'audience' | 'personality' | 'story' | 'competition' | 'aesthetics' | 'logo' | 'results';

export interface ProjectData {
  id: string;
  project_id: string;
  step: StepType;
  data: Json;
  created_at: string;
  updated_at: string;
}

const STEPS: StepType[] = ['basics', 'brand-name-generator', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'logo'];
const REQUIRED_FIELDS: Record<StepType, string[]> = {
  basics: ['industry', 'businessName', 'productService'],
  'brand-name-generator': ['brandName'],
  audience: ['demographics', 'psychographics'],
  personality: ['personalityTraits', 'selectedArchetype'],
  story: ['mission', 'vision', 'values'],
  competition: ['competitors', 'differentiators'],
  aesthetics: ['visualStyle', 'colorPreferences'],
  logo: ['logo'],
  results: []
};

export const useProjectData = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateStepData = (step: StepType, data: any): boolean => {
    const requiredFields = REQUIRED_FIELDS[step];
    if (!requiredFields.length) return true;

    return requiredFields.every(field => {
      const value = data[field];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return !!value;
    });
  };

  const getStepData = useCallback(async (step: StepType): Promise<Json | null> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
      return null;
    }

    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // First, verify the project belongs to the user
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (projectError) {
          if (projectError.code === 'PGRST301' || projectError.message.includes('insufficient resources')) {
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
          }
          throw new Error('Project not found or access denied');
        }

        // Check if step data exists
        const { data: existingData, error: checkError } = await supabase
          .from('project_data')
          .select('data')
          .eq('project_id', projectId)
          .eq('step', step)
          .single();

        if (checkError) {
          if (checkError.code === 'PGRST116') {
            return {};
          }
          throw new Error(checkError.message);
        }

        return existingData?.data || {};
      } catch (err) {
        if (retryCount < maxRetries - 1) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          continue;
        }
        const message = err instanceof Error ? err.message : 'Failed to fetch step data';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        if (retryCount === maxRetries - 1) {
          setLoading(false);
        }
      }
    }
    setLoading(false);
    return null;
  }, [user, projectId]);

  const saveStepData = useCallback(async (step: StepType, data: any): Promise<boolean> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
      return false;
    }

    if (!validateStepData(step, data)) {
      toast.error(`Please complete all required fields for ${step} step`);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify the project belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) {
        toast.error('Project not found or access denied');
        throw new Error('Project not found or access denied');
      }

      // Check if step data already exists
      const { data: existingData, error: checkError } = await supabase
        .from('project_data')
        .select('id')
        .eq('project_id', projectId)
        .eq('step', step)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        toast.error(checkError.message);
        throw new Error(checkError.message);
      }

      const now = new Date().toISOString();

      if (existingData) {
        // Update existing data
        const { error } = await supabase
          .from('project_data')
          .update({ data, updated_at: now })
          .eq('id', existingData.id);

        if (error) {
          toast.error(error.message);
          throw new Error(error.message);
        }
      } else {
        // Insert new data
        const { error } = await supabase
          .from('project_data')
          .insert([{
            project_id: projectId,
            step,
            data,
            created_at: now,
            updated_at: now
          }]);

        if (error) {
          toast.error(error.message);
          throw new Error(error.message);
        }
      }

      // Update project status and completion percentage
      await updateProjectProgress(projectId);

      toast.success('Step data saved successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save step data';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const updateProjectProgress = useCallback(async (projectId: string): Promise<void> => {
    try {
      console.log(`[updateProjectProgress] Starting for projectId: ${projectId}`);
      // Get all steps for this project
      const { data: steps, error } = await supabase
        .from('project_data')
        .select('step, data')
        .eq('project_id', projectId);

      if (error) {
        console.error('[updateProjectProgress] Error fetching project_data:', error);
        toast.error(error.message);
        throw new Error(error.message);
      }

      console.log('[updateProjectProgress] Fetched project_data steps:', steps);

      // Calculate completion percentage based on valid steps
      const validSteps = steps?.filter(step => 
        step.step !== 'results' && validateStepData(step.step as StepType, step.data)
      ) || [];

      console.log('[updateProjectProgress] Valid steps:', validSteps);
      const percentage = Math.round((validSteps.length / STEPS.length) * 100);
      console.log(`[updateProjectProgress] Calculated percentage: ${percentage}`);

      // Determine status
      let status: 'draft' | 'in-progress' | 'completed' = 'draft';
      if (percentage === 100) {
        status = 'completed';
      } else if (percentage > 0) {
        status = 'in-progress';
      }
      console.log(`[updateProjectProgress] Determined status: ${status}`);

      // Update project
      console.log('[updateProjectProgress] Attempting to update projects table...');
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          status,
          completion_percentage: percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('[updateProjectProgress] Error updating projects table:', updateError);
        toast.error(updateError.message);
        throw new Error(updateError.message);
      }
      console.log('[updateProjectProgress] Successfully updated projects table.');
    } catch (err) {
      // Log the error caught by the outer try-catch
      console.error('[updateProjectProgress] Caught error:', err);
      // Toast remains generic, but console has details
      toast.error('Failed to update project progress (see console for details)'); 
    }
  }, []);

  return {
    loading,
    error,
    getStepData,
    saveStepData,
  };
};
