import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserSettings {
  id?: string;
  user_id: string;
  gemini_api_key: string | null;
  ideogram_api_key: string | null;
  clipdrop_api_key: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user settings
  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching settings for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        console.error('Error fetching user settings:', error);
        toast.error('Failed to load user settings');
        return;
      }
      
      const defaultSettings: UserSettings = { 
        user_id: user.id,
        gemini_api_key: '',
        ideogram_api_key: '',
        clipdrop_api_key: '',
        created_at: null,
        updated_at: null
      };
      
      if (data) {
        console.log('Settings found in database:', data);
        setSettings(data as UserSettings);
      } else {
        console.log('No settings found, using defaults');
        setSettings(defaultSettings);
        // Auto-create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating default settings:', createError);
        } else if (newSettings) {
          console.log('Created default settings:', newSettings);
          setSettings(newSettings as UserSettings);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching settings:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Save user settings
  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      toast.error('You must be logged in to save settings');
      return null;
    }

    try {
      setLoading(true);
      console.log('Saving settings for user:', user.id, newSettings);
      
      // Check if settings already exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing settings:', fetchError);
        toast.error('Failed to save settings');
        return null;
      }

      let result;
      
      if (existingSettings) {
        console.log('Updating existing settings');
        // Update existing settings
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating settings:', error);
          toast.error('Failed to update settings');
          return null;
        }
        
        console.log('Settings updated successfully:', data);
        result = data as UserSettings;
      } else {
        console.log('Creating new settings');
        // Insert new settings
        const { data, error } = await supabase
          .from('user_settings')
          .insert([{
            user_id: user.id,
            gemini_api_key: '',
            ideogram_api_key: '',
            clipdrop_api_key: '',
            ...newSettings
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating settings:', error);
          toast.error('Failed to create settings');
          return null;
        }
        
        console.log('Settings created successfully:', data);
        result = data as UserSettings;
      }
      
      setSettings(result);
      toast.success('Settings saved successfully');
      return result;
    } catch (error) {
      console.error('Unexpected error saving settings:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching settings');
      fetchSettings();
    } else {
      console.log('No user, clearing settings');
      setSettings(null);
      setLoading(false);
    }
  }, [user]);
  
  // Debug log when settings change
  useEffect(() => {
    console.log('Settings state updated:', settings);
  }, [settings]);

  return {
    settings,
    loading,
    fetchSettings,
    saveSettings
  };
}
