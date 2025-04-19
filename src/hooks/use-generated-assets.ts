import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { GeneratedLogo } from '@/types/logo';

// Logging utility to prevent excessive console logs
// Set to true only during development/debugging
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

export type AssetType = 'logo' | 'logos' | 'color_palette' | 'color_palette_suggestions' | 'color_palette_preferences' | 'brand_name' | 'brand_name_suggestions' | 'mission_statement' | 'vision_statement' | 'value_proposition' | 'brand_essence' | 'brand_voice' | 'moodboard';

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
      // Basic validation for a single logo
      if (typeof data === 'object' && typeof data.url === 'string') {
        return true;
      }
      
      // Check if this is a collection of logos
      if (data.logos && Array.isArray(data.logos)) {
        return data.logos.every(logo => 
          typeof logo === 'object' && typeof logo.url === 'string'
        );
      }
      
      return false;
    } catch {
      return false;
    }
  },
  logos: (content) => {
    try {
      const data = JSON.parse(content);
      // Validate the logos array
      if (data.logos && Array.isArray(data.logos)) {
        return data.logos.every(logo => 
          typeof logo === 'object' && typeof logo.url === 'string'
        );
      }
      return false;
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
  brand_name_suggestions: (content) => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) && 
             data.every((item: any) => 
               typeof item === 'object' && 
               typeof item.name === 'string' && 
               typeof item.explanation === 'string'
             );
    } catch {
      return false;
    }
  },
  color_palette_suggestions: (content) => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data) && 
             data.every((item: any) => 
               typeof item === 'object' && 
               typeof item.id === 'string' && 
               Array.isArray(item.colors) && 
               item.colors.every((color: any) => 
                 typeof color === 'object' && 
                 typeof color.hex === 'string' && 
                 typeof color.name === 'string'
               )
             );
    } catch {
      return false;
    }
  },
  color_palette_preferences: (content) => {
    try {
      const data = JSON.parse(content);
      return typeof data === 'object' &&
             Array.isArray(data.aestheticPreferences) &&
             Array.isArray(data.colorPreferences);
    } catch {
      return false;
    }
  },
  moodboard: (content) => {
    try {
      const data = JSON.parse(content);
      return Array.isArray(data.images) && 
             data.images.every((url: any) => typeof url === 'string');
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
      return false;
    }
    return validator(content);
  };

  const getAssets = useCallback(async (type?: AssetType): Promise<GeneratedAsset[]> => {
    if (!user || !projectId) {
      log.error('Authentication required for getAssets');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      log.debug(`getAssets: Fetching assets${type ? ` of type ${type}` : ''} for project ${projectId}`);
      
      // First, verify the project belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        log.error(`Project verification failed: ${projectError?.message || 'Project not found'}`);
        return [];
      }

      log.debug(`getAssets: Project verified`);

      let assets: any[] = [];

      // Use a direct query to get assets
      let query = supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId);
        
      // If type is provided, filter by it
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data: queryAssets, error: queryError } = await query
        .order('created_at', { ascending: false });

      if (queryError) {
        log.error(`Error fetching assets: ${queryError.message}`);
        return [];
      }

      assets = queryAssets || [];

      log.debug(`getAssets: Found ${assets.length} assets`);

      // Validate and type the assets
      const validAssets = assets
        .map(asset => ({
          ...asset,
          type: asset.type as AssetType
        }))
        .filter(asset => validateAsset(asset.type, asset.content));

      return validAssets;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(message);
      log.error(`getAssets error: ${message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const getAsset = useCallback(async (type: AssetType): Promise<GeneratedAsset | null> => {
    if (!user || !projectId) {
      log.error('Authentication required for getAsset');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      log.debug(`getAsset: Fetching asset of type ${type} for project ${projectId}`);
      
      // First, verify the project belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        log.error(`Project verification failed: ${projectError?.message || 'Project not found'}`);
        return null;
      }

      log.debug(`getAsset: Project verified`);

      // Use a direct query instead of the stored procedure
      const { data: assets, error: assetsError } = await supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (assetsError) {
        log.error(`Error fetching asset: ${assetsError.message}`);
        return null;
      }

      log.debug(`getAsset: Found ${assets?.length || 0} assets of type ${type}`);

      // Get the latest asset
      if (!assets || assets.length === 0) {
        return null;
      }

      const latestAsset = assets[0];

      // Validate the asset
      const typedData = {
        ...latestAsset,
        type: latestAsset.type as AssetType
      };

      if (!validateAsset(typedData.type, typedData.content)) {
        log.error(`Asset validation failed for type ${type}`);
        return null;
      }

      return typedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(message);
      log.error(`getAsset error: ${message}`);
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

      // Don't show success toast - it's too noisy
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

  // Special function to get all logos for a project
  const getAllLogos = useCallback(async (): Promise<GeneratedLogo[]> => {
    if (!user) {
      log.error('Authentication required for getAllLogos');
      return [];
    }
    
    if (!projectId) {
      log.error('Project ID is required for getAllLogos');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      log.debug(`getAllLogos: Fetching logos for project ${projectId}`);
      
      // First, verify the project belongs to the user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        log.error(`Project verification failed: ${projectError?.message || 'Project not found'}`);
        toast.error('Project not found or access denied');
        return [];
      }

      log.debug(`getAllLogos: Project verified`);

      // Use a direct query instead of the stored procedure
      const { data: logosAssets, error: logosError } = await supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'logos')
        .order('created_at', { ascending: false });

      if (logosError) {
        log.error(`Error fetching logos assets: ${logosError.message}`);
        return [];
      }

      log.debug(`getAllLogos: Found ${logosAssets?.length || 0} logos assets`);

      // If we have a logos asset, parse it
      if (logosAssets && logosAssets.length > 0 && logosAssets[0].content) {
        try {
          const logosData = JSON.parse(logosAssets[0].content);
          if (logosData && logosData.logos && Array.isArray(logosData.logos)) {
            log.debug(`getAllLogos: Successfully parsed logos asset with ${logosData.logos.length} logos`);
            // Ensure each logo has a unique ID
            return logosData.logos.map((logo, index) => ({
              ...logo,
              id: logo.id || `logo-restored-${index}`
            }));
          }
        } catch (parseError) {
          log.error(`Error parsing logos asset: ${parseError}`);
        }
      }

      // If no logos asset or parsing failed, try to get single logo
      const { data: logoAssets, error: logoError } = await supabase
        .from('generated_assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('type', 'logo')
        .order('created_at', { ascending: false });

      if (logoError) {
        log.error(`Error fetching logo assets: ${logoError.message}`);
        return [];
      }

      log.debug(`getAllLogos: Found ${logoAssets?.length || 0} logo assets`);

      // If we have a logo asset, parse it
      if (logoAssets && logoAssets.length > 0 && logoAssets[0].content) {
        try {
          const logoData = JSON.parse(logoAssets[0].content);
          if (typeof logoData === 'object' && typeof logoData.url === 'string') {
            log.debug(`getAllLogos: Successfully parsed single logo asset`);
            return [logoData];
          }
        } catch (parseError) {
          log.error(`Error parsing logo asset: ${parseError}`);
        }
      }

      log.debug(`getAllLogos: No logos found for project ${projectId}`);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logos';
      setError(message);
      log.error(`getAllLogos error: ${message}`);
      return [];
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
    deleteAsset,
    getAllLogos
  };
};
