import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  console.log("useProjects hook - user:", user);

  const getProjects = useCallback(async (): Promise<Project[]> => {
    console.log("getProjects - starting");
    if (!user) {
      console.log("getProjects - no user, returning empty array");
      setError("Authentication required. Please log in.");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log("getProjects - fetching projects for user:", user.id);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("getProjects - error:", error);

        // Check for specific error types
        if (error.code === 'PGRST301') {
          throw new Error('Database connection error. Please try again later.');
        } else if (error.code === '42501') {
          throw new Error('Permission denied. You may not have access to this resource.');
        } else {
          throw new Error(error.message);
        }
      }

      console.log("getProjects - success, projects:", data);
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      console.error("getProjects - caught error:", message);
      setError(message);
      return [];
    } finally {
      setLoading(false);
      console.log("getProjects - finished, loading set to false");
    }
  }, [user, setLoading, setError]);

  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError]);

  const createProject = useCallback(async (project: {
    name: string;
    industry: string;
    description?: string;
  }): Promise<Project | null> => {
    console.log("createProject - starting with project:", project);
    if (!user) {
      console.log("createProject - no user, returning null");
      setError("Authentication required. Please log in.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const newProject = {
        ...project,
        user_id: user.id,
        status: 'draft' as const,
        completion_percentage: 0,
      };

      console.log("createProject - inserting new project:", newProject);

      // First, insert the new project
      const { error: insertError } = await supabase
        .from('projects')
        .insert([newProject]);

      if (insertError) {
        console.error("createProject - insert error:", insertError);

        // Check for specific error types
        if (insertError.code === 'PGRST301') {
          throw new Error('Database connection error. Please try again later.');
        } else if (insertError.code === '42501') {
          throw new Error('Permission denied. You may not have access to create projects.');
        } else if (insertError.code === '23505') {
          throw new Error('A project with this name already exists. Please choose a different name.');
        } else {
          throw new Error(insertError.message);
        }
      }

      // Add a small delay to ensure the insert has been processed
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log("createProject - fetching newly created project");

      // Then, fetch the newly created project
      // We need to query by user_id and name since we don't have the ID yet
      const { data, error: selectError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', project.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (selectError) {
        console.error("createProject - select error:", selectError);
        throw new Error('Project was created but could not be retrieved. Please check your projects list.');
      }

      if (!data) {
        console.error("createProject - no data returned from select");
        throw new Error('Project was created but no data was returned. Please check your projects list.');
      }

      console.log("createProject - success, created project:", data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      console.error("createProject - caught error:", message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
      console.log("createProject - finished, loading set to false");
    }
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
