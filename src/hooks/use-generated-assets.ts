import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AssetType = 'logo' | 'color_palette' | 'brand_name' | 'mission_statement' | 'vision_statement' | 'value_proposition' | 'brand_essence' | 'brand_voice';

export interface GeneratedAsset {
  id: string;
  project_id: string;
  type: AssetType;
  content: string;
  metadata: Json | null;
  created_at: string;
}

const ASSET_VALIDATORS: Record<AssetType, (content: string) => boolean> = {
  logo: (content) => {
    try {
      const data = JSON.parse(content);
      return typeof data === 'object' && 
             typeof data.url === 'string' && 
             typeof data.prompt === 'string';
    } catch {
      return false;
    }
  },
  color_palette: (content) => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data.colors) && 
             data.colors.every((color: any) => 
               typeof color === 'object' && 
               typeof color.hex === 'string' && 
               typeof color.name === 'string'
             );
    } catch {
      return false;
    }
  },
  brand_name: (content) => typeof content === 'string' && content.length > 0,
  mission_statement: (content) => typeof content === 'string' && content.length > 0,
  vision_statement: (content) => typeof content === 'string' && content.length > 0,
  value_proposition: (content) => typeof content === 'string' && content.length > 0,
  brand_essence: (content) => typeof content === 'string' && content.length > 0,
  brand_voice: (content) => typeof content === 'string' && content.length > 0
};

export const useGeneratedAssets = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const validateAsset = (type: AssetType, content: string): boolean => {
    const validator = ASSET_VALIDATORS[type];
    if (!validator) {
      console.error(`No validator found for asset type: ${type}`);
      return false;
    }
    return validator(content);
  };

  const getAssets = useCallback(async (type?: AssetType): Promise<GeneratedAsset[]> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
      return [];
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

      // Then get the assets
      let query = supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
      }

      // Validate assets
      const validAssets = (data || [])
        .map(asset => ({
          ...asset,
          type: asset.type as AssetType
        }))
        .filter(asset => validateAsset(asset.type, asset.content));

      if (validAssets.length !== (data?.length || 0)) {
        console.warn('Some assets failed validation and were filtered out');
      }

      return validAssets;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const getAsset = useCallback(async (type: AssetType): Promise<GeneratedAsset | null> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
      return null;
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

      // Then get the latest asset of the specified type
      const { data, error } = await supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast.error(error.message);
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      // Validate the asset
      const typedData = {
        ...data,
        type: data.type as AssetType
      };

      if (!validateAsset(typedData.type, typedData.content)) {
        console.warn(`Invalid asset content for type: ${type}`);
        return null;
      }

      return typedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const saveAsset = useCallback(async (type: AssetType, content: string, metadata?: Json): Promise<GeneratedAsset | null> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
      return null;
    }

    if (!validateAsset(type, content)) {
      toast.error(`Invalid content for asset type: ${type}`);
      return null;
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

      // Insert the asset
      const { data, error } = await supabase
        .from('generated_assets')
        .insert([{
          project_id: projectId,
          type,
          content,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned after insert');
      }

      const typedData = {
        ...data,
        type: data.type as AssetType
      };

      toast.success('Asset saved successfully');
      return typedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save asset';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !projectId) {
      toast.error('Authentication required');
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

      // Then verify the asset belongs to the project
      const { data: asset, error: assetError } = await supabase
        .from('generated_assets')
        .select('id')
        .eq('id', id)
        .eq('project_id', projectId)
        .single();

      if (assetError) {
        toast.error('Asset not found or access denied');
        throw new Error('Asset not found or access denied');
      }

      // Delete the asset
      const { error } = await supabase
        .from('generated_assets')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
      }

      toast.success('Asset deleted successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  return {
    loading,
    error,
    getAssets,
    getAsset,
    saveAsset,
    deleteAsset
  };
};
