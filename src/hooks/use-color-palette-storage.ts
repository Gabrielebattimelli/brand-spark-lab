import { useState, useCallback } from 'react';
import { useGeneratedAssets } from './use-generated-assets';
import { GeneratedColorPalette } from '@/integrations/ai/colorPalette';
import { toast } from 'sonner';

interface PalettePreferences {
  aestheticPreferences: string[];
  colorPreferences: string[];
  customPreference?: string;
}

export const useColorPaletteStorage = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const { saveAsset, getAsset } = useGeneratedAssets(projectId);

  /**
   * Save palette preferences to the database
   */
  const savePreferences = useCallback(async (preferences: PalettePreferences) => {
    if (!projectId) {
      return false;
    }

    setLoading(true);
    
    try {
      const content = JSON.stringify(preferences);
      await saveAsset('color_palette_preferences', content);
      return true;
    } catch (error) {
      console.error('Failed to save color palette preferences:', error);
      toast.error('Failed to save color preferences');
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, saveAsset]);

  /**
   * Load palette preferences from the database
   */
  const loadPreferences = useCallback(async (): Promise<PalettePreferences | null> => {
    if (!projectId) {
      return null;
    }

    setLoading(true);
    
    try {
      const preferenceAsset = await getAsset('color_palette_preferences');
      
      if (preferenceAsset && preferenceAsset.content) {
        try {
          return JSON.parse(preferenceAsset.content);
        } catch (e) {
          console.error('Failed to parse color palette preferences:', e);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load color palette preferences:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId, getAsset]);

  /**
   * Save generated color palettes to the database
   */
  const saveColorPalettes = useCallback(async (
    colorPalettes: GeneratedColorPalette[],
    selectedPalette?: GeneratedColorPalette | null,
    preferences?: PalettePreferences
  ) => {
    if (!projectId) {
      return false;
    }

    setLoading(true);
    
    try {
      // Save the full list of color palettes
      const content = JSON.stringify(colorPalettes);
      
      // Add metadata including the selected palette id if provided
      const metadata = selectedPalette ? { selectedPaletteId: selectedPalette.id } : null;
      
      await saveAsset('color_palette_suggestions', content, metadata);
      
      // If there's a selected palette, save it as a separate asset for easier retrieval
      if (selectedPalette) {
        await saveAsset('color_palette', JSON.stringify(selectedPalette));
      }
      
      // If preferences are provided, save those too
      if (preferences) {
        await savePreferences(preferences);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save color palettes:', error);
      toast.error('Failed to save color palette suggestions');
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, saveAsset]);

  /**
   * Save a selected color palette to the database
   */
  const saveSelectedPalette = useCallback(async (
    palette: GeneratedColorPalette
  ) => {
    if (!projectId) {
      return false;
    }

    setLoading(true);
    
    try {
      await saveAsset('color_palette', JSON.stringify(palette));
      return true;
    } catch (error) {
      console.error('Failed to save selected color palette:', error);
      toast.error('Failed to save selected color palette');
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId, saveAsset]);

  /**
   * Load color palette suggestions from the database
   */
  const loadColorPalettes = useCallback(async (): Promise<{
    colorPalettes: GeneratedColorPalette[],
    selectedPalette: GeneratedColorPalette | null
  }> => {
    if (!projectId) {
      return {
        colorPalettes: [],
        selectedPalette: null
      };
    }

    setLoading(true);
    
    try {
      // Get the list of color palette suggestions
      const suggestionsAsset = await getAsset('color_palette_suggestions');
      
      // Get the selected color palette
      const selectedPaletteAsset = await getAsset('color_palette');
      
      let colorPalettes: GeneratedColorPalette[] = [];
      let selectedPalette: GeneratedColorPalette | null = null;
      
      // Parse the suggestions if available
      if (suggestionsAsset && suggestionsAsset.content) {
        try {
          colorPalettes = JSON.parse(suggestionsAsset.content);
        } catch (e) {
          console.error('Failed to parse color palette suggestions:', e);
          colorPalettes = [];
        }
      }
      
      // Parse the selected palette if available
      if (selectedPaletteAsset && selectedPaletteAsset.content) {
        try {
          selectedPalette = JSON.parse(selectedPaletteAsset.content);
        } catch (e) {
          console.error('Failed to parse selected color palette:', e);
          selectedPalette = null;
        }
      }
      
      return {
        colorPalettes,
        selectedPalette
      };
    } catch (error) {
      console.error('Failed to load color palettes:', error);
      toast.error('Failed to load color palette suggestions');
      
      return {
        colorPalettes: [],
        selectedPalette: null
      };
    } finally {
      setLoading(false);
    }
  }, [projectId, getAsset]);

  return {
    loading,
    saveColorPalettes,
    saveSelectedPalette,
    loadColorPalettes,
    savePreferences,
    loadPreferences
  };
};
