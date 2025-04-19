import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Logging utility to prevent excessive console logs
// Set to false to disable verbose logging
const ENABLE_VERBOSE_LOGGING = false;

const log = {
  debug: (message: string) => {
    if (ENABLE_VERBOSE_LOGGING) {
      console.log(message);
    }
  },
  error: (message: string) => {
    console.error(message);
  }
};

export interface Project {
  id: string;
  name: string;
  industry: string;
  description: string | null;
  status: 'draft' | 'in-progress' | 'completed';
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

interface SupabaseProject {
  created_at: string | null;
  description: string | null;
  id: string;
  industry: string | null;
  name: string;
  status: 'draft' | 'in-progress' | 'completed' | null;
  updated_at: string | null;
  user_id: string;
  completion_percentage: number | null;
}

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getProjects = useCallback(async (): Promise<Project[]> => {
    log.debug("getProjects - starting");
    if (!user) {
      log.debug("getProjects - no user, returning empty array");
      setError("Authentication required. Please log in.");
      return [];
    }

    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        log.debug(`getProjects - attempt ${retryCount + 1} of ${maxRetries}`);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          log.error("getProjects - error:" + error.message);

          // Check for specific error types
          if (error.code === 'PGRST301') {
            throw new Error('Database connection error. Please try again later.');
          } else if (error.code === '42501') {
            throw new Error('Permission denied. You may not have access to this resource.');
          } else if (error.message.includes('insufficient resources')) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            retryCount++;
            continue;
          } else {
            throw new Error(error.message);
          }
        }

        log.debug("getProjects - success, projects found: " + (data?.length || 0));
        // Transform Supabase project data to our Project type
        return (data as SupabaseProject[]).map(project => ({
          ...project,
          status: (project.status as "draft" | "in-progress" | "completed") || "draft"
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch projects';
        console.error(`getProjects - attempt ${retryCount + 1} failed:`, message);
        
        if (retryCount === maxRetries - 1) {
          setError(message);
          return [];
        }
        
        retryCount++;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    setLoading(false);
    return [];
  }, [user, setLoading, setError]);

  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        log.debug(`getProject - attempt ${retryCount + 1} of ${maxRetries}`);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.message.includes('insufficient resources')) {
            // Wait longer between retries
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            retryCount++;
            lastError = error;
            continue;
          }
          throw error;
        }

        if (!data) {
          setLoading(false);
          return null;
        }

        // Transform Supabase project data to our Project type
        const project: Project = {
          id: data.id,
          name: data.name,
          industry: data.industry || '',
          description: data.description || null,
          status: data.status === 'draft' || data.status === 'in-progress' || data.status === 'completed' 
            ? data.status 
            : 'draft',
          completion_percentage: data.completion_percentage || 0,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        };

        setLoading(false);
        return project;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch project');
        console.error(`getProject - attempt ${retryCount + 1} failed:`, error.message);
        lastError = error;
        
        if (retryCount === maxRetries - 1) {
          setError(error.message);
          setLoading(false);
          return null;
        }
        
        retryCount++;
        // Exponential backoff with a maximum delay
        const delay = Math.min(2000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setLoading(false);
    return null;
  }, [user]);

  const createProject = useCallback(async (project: {
    name: string;
    industry: string;
    description?: string;
  }): Promise<Project | null> => {
    log.debug("createProject - starting with project name: " + project.name);
    if (!user) {
      log.debug("createProject - no user, returning null");
      setError("Authentication required. Please log in.");
      return null;
    }

    setLoading(true);
    setError(null);

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        log.debug(`createProject - attempt ${retryCount + 1} of ${maxRetries}`);
        const { data, error } = await supabase
          .from('projects')
          .insert({
            name: project.name,
            industry: project.industry,
            description: project.description,
            user_id: user.id,
            status: 'draft' as const,
            completion_percentage: 0
          })
          .select()
          .single();

        if (error) {
          if (error.message.includes('insufficient resources')) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            retryCount++;
            continue;
          }
          throw new Error(error.message);
        }

        // Transform Supabase project data to our Project type
        return data ? {
          ...data,
          status: (data.status as "draft" | "in-progress" | "completed") || "draft"
        } : null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create project';
        console.error(`createProject - attempt ${retryCount + 1} failed:`, message);
        
        if (retryCount === maxRetries - 1) {
          setError(message);
          return null;
        }
        
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    setLoading(false);
    return null;
  }, [user, setLoading, setError]);

  const updateProject = useCallback(async (
    id: string,
    updates: Partial<Omit<Project, 'id' | 'created_at' | 'user_id'>>
  ): Promise<Project | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
};
