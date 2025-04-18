import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export type StepType = 'basics' | 'audience' | 'personality' | 'story' | 'competition' | 'aesthetics' | 'results';

export interface ProjectData {
  id: string;
  project_id: string;
  step: StepType;
  data: Json;
  created_at: string;
  updated_at: string;
}

export const useProjectData = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getStepData = async (step: StepType): Promise<Json | null> => {
    if (!user || !projectId) return null;

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

      if (projectError) throw new Error('Project not found or access denied');

      // Then get the step data
      const { data, error } = await supabase
        .from('project_data')
        .select('*')
        .eq('project_id', projectId)
        .eq('step', step)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw new Error(error.message);
      }

      return data?.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch step data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveStepData = async (step: StepType, data: any): Promise<boolean> => {
    if (!user || !projectId) return false;

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

      if (projectError) throw new Error('Project not found or access denied');

      // Check if step data already exists
      const { data: existingData, error: checkError } = await supabase
        .from('project_data')
        .select('id')
        .eq('project_id', projectId)
        .eq('step', step)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }

      if (existingData) {
        // Update existing data
        const { error } = await supabase
          .from('project_data')
          .update({ data, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (error) throw new Error(error.message);
      } else {
        // Insert new data
        const { error } = await supabase
          .from('project_data')
          .insert([{
            project_id: projectId,
            step,
            data,
          }]);

        if (error) throw new Error(error.message);
      }

      // Update project status and completion percentage
      await updateProjectProgress(projectId);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save step data';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectProgress = async (projectId: string): Promise<void> => {
    try {
      // Get all steps for this project
      const { data: steps, error } = await supabase
        .from('project_data')
        .select('step')
        .eq('project_id', projectId);

      if (error) throw new Error(error.message);

      // Calculate completion percentage
      const totalSteps = 6; // Excluding results step
      const completedSteps = steps?.filter(s => s.step !== 'results').length || 0;
      const percentage = Math.round((completedSteps / totalSteps) * 100);

      // Determine status
      let status: 'draft' | 'in-progress' | 'completed' = 'draft';
      if (percentage === 100) {
        status = 'completed';
      } else if (percentage > 0) {
        status = 'in-progress';
      }

      // Update project
      await supabase
        .from('projects')
        .update({
          status,
          completion_percentage: percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);
    } catch (err) {
      console.error('Failed to update project progress:', err);
    }
  };

  return {
    loading,
    error,
    getStepData,
    saveStepData,
  };
};
