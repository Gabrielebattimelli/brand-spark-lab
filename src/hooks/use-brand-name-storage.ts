import { useState, useCallback } from 'react';
import { useGeneratedAssets } from './use-generated-assets';
import { BrandNameWithExplanation } from '@/contexts/AIContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBrandNameStorage = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const { saveAsset, getAsset } = useGeneratedAssets(projectId);
  const { user } = useAuth();
  
  // Helper function to verify project ownership
  const verifyProjectOwnership = useCallback(async (): Promise<boolean> => {
    if (!user || !projectId) return false;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (error || !data) {
        console.error('Project verification failed:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error verifying project ownership:', err);
      return false;
    }
  }, [user, projectId]);

  /**
   * Save generated brand names to the database
   */
  const saveBrandNames = useCallback(async (
    brandNamesWithExplanations: BrandNameWithExplanation[],
    selectedName?: string
  ) => {
    if (!projectId) {
      console.warn('Cannot save brand names: No project ID provided');
      return false;
    }

    // Verify project ownership before saving
    const isOwner = await verifyProjectOwnership();
    if (!isOwner) {
      console.error(`User does not own project ${projectId}`);
      toast.error('You do not have permission to save to this project');
      return false;
    }

    setLoading(true);
    
    try {
      // Ensure each brand name has the correct project ID
      const brandNamesWithProjectId = brandNamesWithExplanations.map(item => ({
        ...item,
        projectId: projectId // Ensure project ID is set correctly
      }));
      
      // Save the full list of brand names with explanations
      const content = JSON.stringify(brandNamesWithProjectId);
      
      // Add metadata including the selected name and project ID for additional verification
      const metadata = {
        selectedName: selectedName || null,
        projectId: projectId
      };
      
      console.log(`Saving brand names for project ${projectId}:`, brandNamesWithProjectId.length);
      await saveAsset('brand_name_suggestions', content, metadata);
      
      // If there's a selected name, save it as a separate asset for easier retrieval
      if (selectedName) {
        await saveAsset('brand_name', selectedName, { projectId });
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to save brand names for project ${projectId}:`, error);
      toast.error('Failed to save brand name suggestions');
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, saveAsset, verifyProjectOwnership]);

  /**
   * Load brand name suggestions from the database
   */
  const loadBrandNames = useCallback(async (): Promise<{
    brandNames: string[],
    brandNamesWithExplanations: BrandNameWithExplanation[],
    selectedName: string | null
  }> => {
    if (!projectId) {
      console.warn('Cannot load brand names: No project ID provided');
      return {
        brandNames: [],
        brandNamesWithExplanations: [],
        selectedName: null
      };
    }

    // Verify project ownership before loading
    const isOwner = await verifyProjectOwnership();
    if (!isOwner) {
      console.error(`User does not own project ${projectId}`);
      return {
        brandNames: [],
        brandNamesWithExplanations: [],
        selectedName: null
      };
    }

    setLoading(true);
    
    try {
      console.log(`Loading brand names for project ${projectId}`);
      
      // Get the list of brand name suggestions with explanations
      const suggestionsAsset = await getAsset('brand_name_suggestions');
      
      // Get the selected brand name
      const selectedNameAsset = await getAsset('brand_name');
      
      let brandNamesWithExplanations: BrandNameWithExplanation[] = [];
      let selectedName: string | null = null;
      
      // Parse the suggestions if available
      if (suggestionsAsset && suggestionsAsset.content) {
        try {
          const parsedNames: BrandNameWithExplanation[] = JSON.parse(suggestionsAsset.content);
          
          // Verify that these brand names belong to the current project
          // This is a critical check to prevent loading names from other projects
          if (suggestionsAsset.metadata && typeof suggestionsAsset.metadata === 'object' && 'projectId' in suggestionsAsset.metadata) {
            const assetProjectId = String(suggestionsAsset.metadata.projectId);
            
            if (assetProjectId !== projectId) {
              console.error(`Asset belongs to project ${assetProjectId}, not current project ${projectId}`);
              // Don't load these brand names as they belong to a different project
              brandNamesWithExplanations = [];
            } else {
              console.log(`Successfully loaded ${parsedNames.length} brand names for project ${projectId}`);
              brandNamesWithExplanations = parsedNames;
            }
          } else {
            // For backward compatibility with existing data that might not have projectId
            // Verify using the projectId property on the brand names themselves
            const belongsToCurrentProject = !parsedNames[0]?.projectId || 
                                          parsedNames[0].projectId === projectId;
                                          
            if (!belongsToCurrentProject) {
              console.error(`Brand names belong to project ${parsedNames[0].projectId}, not current project ${projectId}`);
              // Don't load these brand names as they belong to a different project
              brandNamesWithExplanations = [];
            } else {
              console.log(`Successfully loaded ${parsedNames.length} brand names for project ${projectId}`);
              brandNamesWithExplanations = parsedNames;
            }
          }
        } catch (e) {
          console.error(`Failed to parse brand name suggestions for project ${projectId}:`, e);
          brandNamesWithExplanations = [];
        }
      } else {
        console.log(`No brand name suggestions found for project ${projectId}`);
      }
      
      // Get the selected name if available
      if (selectedNameAsset && selectedNameAsset.content) {
        // Verify this selected name belongs to the current project
        if (selectedNameAsset.metadata && typeof selectedNameAsset.metadata === 'object' && 'projectId' in selectedNameAsset.metadata) {
          const assetProjectId = String(selectedNameAsset.metadata.projectId);
          
          if (assetProjectId !== projectId) {
            console.error(`Selected name belongs to project ${assetProjectId}, not current project ${projectId}`);
            // Don't load this selected name as it belongs to a different project
            selectedName = null;
          } else {
            selectedName = selectedNameAsset.content;
          }
        } else {
          // For backward compatibility
          selectedName = selectedNameAsset.content;
        }
      }
      
      // Extract just the names for convenience
      const brandNames = brandNamesWithExplanations.map(item => item.name);
      
      return {
        brandNames,
        brandNamesWithExplanations,
        selectedName
      };
    } catch (error) {
      console.error(`Failed to load brand names for project ${projectId}:`, error);
      toast.error('Failed to load brand name suggestions');
      
      return {
        brandNames: [],
        brandNamesWithExplanations: [],
        selectedName: null
      };
    } finally {
      setLoading(false);
    }
  }, [projectId, getAsset, verifyProjectOwnership]);

  return {
    loading,
    saveBrandNames,
    loadBrandNames
  };
};
