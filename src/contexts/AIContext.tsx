import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUserSettings } from "@/hooks/use-user-settings";
import { toast } from "sonner";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { StatementWithExplanation, ValueWithExplanation, VoiceCharacteristic } from "@/integrations/ai/gemini";
import { GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { useProjectData, StepType } from "@/hooks/use-project-data";
import { useLocation, useParams } from "react-router-dom";
import { useProjects } from "@/hooks/use-projects";
import { useGeneratedAssets } from "@/hooks/use-generated-assets";
import { useAuth } from "@/contexts/AuthContext";

// Define the interface for brand names with explanations
export interface BrandNameWithExplanation {
  name: string;
  explanation: string;
  projectId?: string; // Add project ID to track which project the brand name belongs to
}

// Define the shape of project data
interface ProjectData {
  logo?: GeneratedLogo;
  aiGenerated?: {
    logo?: GeneratedLogo;
  };
}

// Define the shape of the AI context
interface AIContextType {
  // API Keys
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  ideogramApiKey: string;
  setIdeogramApiKey: (key: string) => void;
  clipdropApiKey: string;
  setClipdropApiKey: (key: string) => void;

  // Generated content
  generatedBrandNames: string[];
  setGeneratedBrandNames: (names: string[]) => void;
  generatedBrandNamesWithExplanations: BrandNameWithExplanation[];
  setGeneratedBrandNamesWithExplanations: (namesWithExplanations: BrandNameWithExplanation[], projectId?: string) => void;
  selectedBrandName: string;
  setSelectedBrandName: (name: string, projectId?: string) => void;

  generatedMissionStatements: string[];
  setGeneratedMissionStatements: (statements: string[]) => void;
  generatedMissionStatementsWithExplanations: StatementWithExplanation[];
  setGeneratedMissionStatementsWithExplanations: (statements: StatementWithExplanation[]) => void;
  selectedMissionStatement: string;
  setSelectedMissionStatement: (statement: string) => void;
  selectedMissionStatementExplanation: string;
  setSelectedMissionStatementExplanation: (explanation: string) => void;

  generatedVisionStatements: string[];
  setGeneratedVisionStatements: (statements: string[]) => void;
  generatedVisionStatementsWithExplanations: StatementWithExplanation[];
  setGeneratedVisionStatementsWithExplanations: (statements: StatementWithExplanation[]) => void;
  selectedVisionStatement: string;
  setSelectedVisionStatement: (statement: string) => void;
  selectedVisionStatementExplanation: string;
  setSelectedVisionStatementExplanation: (explanation: string) => void;

  generatedValuePropositions: string[];
  setGeneratedValuePropositions: (propositions: string[]) => void;
  generatedValuePropositionsWithExplanations: StatementWithExplanation[];
  setGeneratedValuePropositionsWithExplanations: (propositions: StatementWithExplanation[]) => void;
  selectedValueProposition: string;
  setSelectedValueProposition: (proposition: string) => void;
  selectedValuePropositionExplanation: string;
  setSelectedValuePropositionExplanation: (explanation: string) => void;

  generatedBrandEssence: string[];
  setGeneratedBrandEssence: (essence: string[]) => void;
  generatedBrandEssenceWithExplanations: StatementWithExplanation[];
  setGeneratedBrandEssenceWithExplanations: (essence: StatementWithExplanation[]) => void;
  selectedBrandEssence: string;
  setSelectedBrandEssence: (essence: string) => void;
  selectedBrandEssenceExplanation: string;
  setSelectedBrandEssenceExplanation: (explanation: string) => void;

  generatedBrandVoice: string[];
  setGeneratedBrandVoice: (voice: string[]) => void;
  generatedBrandVoiceCharacteristics: VoiceCharacteristic[];
  setGeneratedBrandVoiceCharacteristics: (characteristics: VoiceCharacteristic[]) => void;
  selectedBrandVoice: string;
  setSelectedBrandVoice: (voice: string) => void;
  selectedBrandVoiceExplanation: string;
  setSelectedBrandVoiceExplanation: (explanation: string) => void;

  generatedColorPalettes: GeneratedColorPalette[];
  setGeneratedColorPalettes: (palettes: GeneratedColorPalette[]) => void;
  selectedColorPalette: GeneratedColorPalette | null;
  setSelectedColorPalette: (palette: GeneratedColorPalette | null) => void;

  generatedLogos: GeneratedLogo[];
  setGeneratedLogos: (logos: GeneratedLogo[]) => void;
  selectedLogo: GeneratedLogo | null;
  setSelectedLogo: (logo: GeneratedLogo | null) => void;

  // Loading states
  isGeneratingText: boolean;
  setIsGeneratingText: (isGenerating: boolean) => void;
  isGeneratingLogos: boolean;
  setIsGeneratingLogos: (isGenerating: boolean) => void;
  isGeneratingPalettes: boolean;
  setIsGeneratingPalettes: (isGenerating: boolean) => void;

  // Reset function
  resetGeneratedContent: () => void;
}

// Create the context with a default value
const AIContext = createContext<AIContextType | undefined>(undefined);

// Provider component
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use the user settings hook for API keys persistence
  const { settings, loading: settingsLoading, saveSettings } = useUserSettings();
  const { pathname } = useLocation();
  const { projectId } = useParams();
  const { user } = useAuth();

  // Use the project data hook at the component level
  const { getStepData } = useProjectData(projectId);
  
  // Use the generated assets hook to access logos
  const { getAsset } = useGeneratedAssets(projectId);
  
  // Function to get project data
  const getProjectData = async () => {
    if (!projectId) return null;
    
    try {
      const data = await getStepData('logo' as StepType);
      return data as ProjectData;
    } catch (error) {
      return null;
    }
  };
  
  // API Keys - now initialized from Supabase
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("");
  const [ideogramApiKey, setIdeogramApiKeyState] = useState<string>("");
  const [clipdropApiKey, setClipdropApiKeyState] = useState<string>("");
  const [keysLoaded, setKeysLoaded] = useState<boolean>(false);

  // Generated content
  const [generatedBrandNames, setGeneratedBrandNames] = useState<string[]>([]);
  const [generatedBrandNamesWithExplanations, setGeneratedBrandNamesWithExplanations] = useState<BrandNameWithExplanation[]>([]);
  const [selectedBrandName, setSelectedBrandName] = useState<string>("");

  const [generatedMissionStatements, setGeneratedMissionStatements] = useState<string[]>([]);
  const [generatedMissionStatementsWithExplanations, setGeneratedMissionStatementsWithExplanations] = useState<StatementWithExplanation[]>([]);
  const [selectedMissionStatement, setSelectedMissionStatement] = useState<string>("");
  const [selectedMissionStatementExplanation, setSelectedMissionStatementExplanation] = useState<string>("");

  const [generatedVisionStatements, setGeneratedVisionStatements] = useState<string[]>([]);
  const [generatedVisionStatementsWithExplanations, setGeneratedVisionStatementsWithExplanations] = useState<StatementWithExplanation[]>([]);
  const [selectedVisionStatement, setSelectedVisionStatement] = useState<string>("");
  const [selectedVisionStatementExplanation, setSelectedVisionStatementExplanation] = useState<string>("");

  const [generatedValuePropositions, setGeneratedValuePropositions] = useState<string[]>([]);
  const [generatedValuePropositionsWithExplanations, setGeneratedValuePropositionsWithExplanations] = useState<StatementWithExplanation[]>([]);
  const [selectedValueProposition, setSelectedValueProposition] = useState<string>("");
  const [selectedValuePropositionExplanation, setSelectedValuePropositionExplanation] = useState<string>("");

  const [generatedBrandEssence, setGeneratedBrandEssence] = useState<string[]>([]);
  const [generatedBrandEssenceWithExplanations, setGeneratedBrandEssenceWithExplanations] = useState<StatementWithExplanation[]>([]);
  const [selectedBrandEssence, setSelectedBrandEssence] = useState<string>("");
  const [selectedBrandEssenceExplanation, setSelectedBrandEssenceExplanation] = useState<string>("");

  const [generatedBrandVoice, setGeneratedBrandVoice] = useState<string[]>([]);
  const [generatedBrandVoiceCharacteristics, setGeneratedBrandVoiceCharacteristics] = useState<VoiceCharacteristic[]>([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState<string>("");
  const [selectedBrandVoiceExplanation, setSelectedBrandVoiceExplanation] = useState<string>("");

  const [generatedColorPalettes, setGeneratedColorPalettes] = useState<GeneratedColorPalette[]>([]);
  const [selectedColorPalette, setSelectedColorPalette] = useState<GeneratedColorPalette | null>(null);

  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [selectedLogo, setSelectedLogo] = useState<GeneratedLogo | null>(null);

  // Loading states
  const [isGeneratingText, setIsGeneratingText] = useState<boolean>(false);
  const [isGeneratingLogos, setIsGeneratingLogos] = useState<boolean>(false);
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState<boolean>(false);

  // Reset function
  const resetGeneratedContent = () => {
    setGeneratedBrandNames([]);
    setGeneratedBrandNamesWithExplanations([]);
    setSelectedBrandName("");

    setGeneratedMissionStatements([]);
    setGeneratedMissionStatementsWithExplanations([]);
    setSelectedMissionStatement("");
    setSelectedMissionStatementExplanation("");

    setGeneratedVisionStatements([]);
    setGeneratedVisionStatementsWithExplanations([]);
    setSelectedVisionStatement("");
    setSelectedVisionStatementExplanation("");

    setGeneratedValuePropositions([]);
    setGeneratedValuePropositionsWithExplanations([]);
    setSelectedValueProposition("");
    setSelectedValuePropositionExplanation("");

    setGeneratedBrandEssence([]);
    setGeneratedBrandEssenceWithExplanations([]);
    setSelectedBrandEssence("");
    setSelectedBrandEssenceExplanation("");

    setGeneratedBrandVoice([]);
    setGeneratedBrandVoiceCharacteristics([]);
    setSelectedBrandVoice("");
    setSelectedBrandVoiceExplanation("");

    setGeneratedColorPalettes([]);
    setSelectedColorPalette(null);

    setGeneratedLogos([]);
    setSelectedLogo(null);
  };

  // Initialize generatedLogos with project data if available
  useEffect(() => {
    // Skip initialization if we already have logos or no project ID or no user
    if (generatedLogos.length > 0) {
      console.log(`AIContext: already have ${generatedLogos.length} logos in state, skipping initialization`);
      return;
    }
    
    if (!projectId) {
      console.log(`AIContext: no project ID available, skipping logo initialization`);
      return;
    }
    
    if (!user) {
      console.log(`AIContext: no user available, skipping logo initialization`);
      return;
    }
    
    console.log(`AIContext: initializing logos for project ${projectId} for user ${user.id}`);
    
    // Clear any existing logos
    setGeneratedLogos([]);
    
    const initializeLogos = async () => {
      try {
        console.log(`AIContext: initializing logos for project ${projectId} and user ${user.id}`);
        
        // First, try to get the project data which might contain the selected logo
        const projectData = await getProjectData();
        
        // We'll only use this to initialize the selected logo if we can't find it elsewhere
        const savedLogo = projectData?.logo || (projectData?.aiGenerated && projectData.aiGenerated.logo);
        
        // Try to load all logos from the 'logos' asset
        if (projectId && user) {
          try {
            // Import the useGeneratedAssets hook directly to avoid circular dependencies
            const { supabase } = await import('@/integrations/supabase/client');
            
            // Use a direct query to get the logos
            const { data: logosAssets, error: logosError } = await supabase
              .from('generated_assets')
              .select('*')
              .eq('project_id', projectId)
              .eq('type', 'logos')
              .order('created_at', { ascending: false });
            
            if (logosError) {
              console.error(`Error fetching logos assets: ${logosError.message}`);
              throw logosError;
            }
            
            console.log(`AIContext: Found ${logosAssets?.length || 0} logos assets`);
            
            // If we have a logos asset, parse it
            if (logosAssets && logosAssets.length > 0 && logosAssets[0].content) {
              try {
                const allLogosContent = JSON.parse(logosAssets[0].content);
                
                if (allLogosContent && allLogosContent.logos && Array.isArray(allLogosContent.logos)) {
                  // Ensure each logo has a unique ID
                  const uniqueLogos = allLogosContent.logos.map((logo, index) => ({
                    ...logo,
                    id: logo.id || `logo-restored-${index}`
                  }));
                  
                  // Set the logos in state
                  console.log(`AIContext: loaded ${uniqueLogos.length} logos from 'logos' asset`);
                  setGeneratedLogos(uniqueLogos);
                  
                  // Find the selected logo
                  const selectedLogoId = allLogosContent.selectedLogoId;
                  console.log(`AIContext: looking for selected logo with ID: ${selectedLogoId}`);
                  const selectedLogoFromAssets = uniqueLogos.find(logo => logo.id === selectedLogoId);
                  
                  // Set the selected logo if one was found
                  if (selectedLogoFromAssets) {
                    setSelectedLogo(selectedLogoFromAssets);
                  } else if (savedLogo) {
                    // Fallback to the saved logo from project data
                    setSelectedLogo(savedLogo);
                  }
                  
                  // Log success
                  toast({
                    title: "Logos Restored",
                    description: `Successfully restored ${uniqueLogos.length} logo concepts.`,
                  });
                  
                  return; // Exit early since we've loaded the logos
                }
              } catch (parseError) {
                console.error("Error parsing logos asset:", parseError);
              }
            }
          } catch (assetError) {
            console.error("Error loading logos from assets:", assetError);
          }
        }
        
        // If we couldn't load all logos, at least set the selected logo
        if (savedLogo) {
          console.log(`AIContext: using fallback logo from project data`);
          setSelectedLogo(savedLogo);
          // Also add it to generatedLogos so it's visible
          setGeneratedLogos([savedLogo]);
        } else {
          console.log(`AIContext: no logos found for project ${projectId}`);
        }
      } catch (error) {
        // Silent error - just continue
        console.error("Logo initialization error:", error);
      }
    };

    initializeLogos();
  }, [getProjectData, getAsset, projectId, generatedLogos.length, user]);

  // Set up API key setters that persist to Supabase
  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    saveSettings({ gemini_api_key: key }).catch(() => {
      // Silent error handling
    });
  };

  const setIdeogramApiKey = (key: string) => {
    setIdeogramApiKeyState(key);
    saveSettings({ ideogram_api_key: key }).catch(() => {
      // Silent error handling
    });
  };

  const setClipdropApiKey = (key: string) => {
    setClipdropApiKeyState(key);
    saveSettings({ clipdrop_api_key: key }).catch(() => {
      // Silent error handling
    });
  };

  // Load API keys from settings when they change
  useEffect(() => {
    if (settings) {
      setGeminiApiKeyState(settings.gemini_api_key || "");
      setIdeogramApiKeyState(settings.ideogram_api_key || "");
      setClipdropApiKeyState(settings.clipdrop_api_key || "");
      setKeysLoaded(true);
    }
  }, [settings]);

  const value = {
    // API Keys
    geminiApiKey,
    setGeminiApiKey,
    ideogramApiKey,
    setIdeogramApiKey,
    clipdropApiKey,
    setClipdropApiKey,
    keysLoaded,

    // Generated content
    generatedBrandNames,
    setGeneratedBrandNames,
    generatedBrandNamesWithExplanations,
    setGeneratedBrandNamesWithExplanations,
    selectedBrandName,
    setSelectedBrandName,

    generatedMissionStatements,
    setGeneratedMissionStatements,
    generatedMissionStatementsWithExplanations,
    setGeneratedMissionStatementsWithExplanations,
    selectedMissionStatement,
    setSelectedMissionStatement,
    selectedMissionStatementExplanation,
    setSelectedMissionStatementExplanation,

    generatedVisionStatements,
    setGeneratedVisionStatements,
    generatedVisionStatementsWithExplanations,
    setGeneratedVisionStatementsWithExplanations,
    selectedVisionStatement,
    setSelectedVisionStatement,
    selectedVisionStatementExplanation,
    setSelectedVisionStatementExplanation,

    generatedValuePropositions,
    setGeneratedValuePropositions,
    generatedValuePropositionsWithExplanations,
    setGeneratedValuePropositionsWithExplanations,
    selectedValueProposition,
    setSelectedValueProposition,
    selectedValuePropositionExplanation,
    setSelectedValuePropositionExplanation,

    generatedBrandEssence,
    setGeneratedBrandEssence,
    generatedBrandEssenceWithExplanations,
    setGeneratedBrandEssenceWithExplanations,
    selectedBrandEssence,
    setSelectedBrandEssence,
    selectedBrandEssenceExplanation,
    setSelectedBrandEssenceExplanation,

    generatedBrandVoice,
    setGeneratedBrandVoice,
    generatedBrandVoiceCharacteristics,
    setGeneratedBrandVoiceCharacteristics,
    selectedBrandVoice,
    setSelectedBrandVoice,
    selectedBrandVoiceExplanation,
    setSelectedBrandVoiceExplanation,

    generatedColorPalettes,
    setGeneratedColorPalettes,
    selectedColorPalette,
    setSelectedColorPalette,

    generatedLogos,
    setGeneratedLogos,
    selectedLogo,
    setSelectedLogo,

    // Loading states
    isGeneratingText,
    setIsGeneratingText,
    isGeneratingLogos,
    setIsGeneratingLogos,
    isGeneratingPalettes,
    setIsGeneratingPalettes,

    // Reset function
    resetGeneratedContent,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
