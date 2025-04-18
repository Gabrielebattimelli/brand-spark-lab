import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export type AssetType = 'logo' | 'color_palette' | 'brand_name' | 'mission_statement' | 'vision_statement' | 'value_proposition' | 'brand_essence' | 'brand_voice';

export interface GeneratedAsset {
  id: string;
  project_id: string;
  type: AssetType;
  content: string;
  metadata: Json | null;
  created_at: string;
}

export const useGeneratedAssets = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getAssets = async (type?: AssetType): Promise<GeneratedAsset[]> => {
    if (!user || !projectId) return [];

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

      // Then get the assets
      let query = supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAsset = async (type: AssetType): Promise<GeneratedAsset | null> => {
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

      // Then get the latest asset of the specified type
      const { data, error } = await supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw new Error(error.message);
      }

      return data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveAsset = async (type: AssetType, content: string, metadata?: Json): Promise<GeneratedAsset | null> => {
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

      // Insert the asset
      const { data, error } = await supabase
        .from('generated_assets')
        .insert([{
          project_id: projectId,
          type,
          content,
          metadata
        }])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save asset';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (id: string): Promise<boolean> => {
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

      // Then verify the asset belongs to the project
      const { data: asset, error: assetError } = await supabase
        .from('generated_assets')
        .select('id')
        .eq('id', id)
        .eq('project_id', projectId)
        .single();

      if (assetError) throw new Error('Asset not found or access denied');

      // Delete the asset
      const { error } = await supabase
        .from('generated_assets')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAssets,
    getAsset,
    saveAsset,
    deleteAsset
  };
};
