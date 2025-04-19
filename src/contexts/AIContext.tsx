import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUserSettings } from "@/hooks/use-user-settings";
import { toast } from "sonner";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { StatementWithExplanation, ValueWithExplanation, VoiceCharacteristic } from "@/integrations/ai/gemini";
import { GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { useProjectData, StepType } from "@/hooks/use-project-data";
import { useLocation, useParams } from "react-router-dom";
import { useProjects } from "@/hooks/use-projects";

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

  // Function to get project data
  const getProjectData = async () => {
    if (!projectId) return null;
    
    try {
      const { getStepData } = useProjectData();
      const data = await getStepData('logo' as StepType);
      console.log('Retrieved project data:', data);
      return data as ProjectData;
    } catch (error) {
      console.error('Error getting project data:', error);
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
    const initializeLogos = async () => {
      try {
        const projectData = await getProjectData();
        if (projectData?.logo || projectData?.aiGenerated?.logo) {
          const savedLogo = projectData.logo || projectData.aiGenerated.logo;
          console.log('Initializing generatedLogos with saved logo:', savedLogo);
          setGeneratedLogos([savedLogo]);
          setSelectedLogo(savedLogo);
        }
      } catch (error) {
        console.error('Error initializing generatedLogos:', error);
      }
    };

    initializeLogos();
  }, [getProjectData, projectId]);

  // Set up API key setters that persist to Supabase
  const setGeminiApiKey = (key: string) => {
    console.log('Setting Gemini API key:', key);
    setGeminiApiKeyState(key);
    saveSettings({ gemini_api_key: key })
      .then(result => {
        console.log('Gemini API key saved successfully:', result);
      })
      .catch(error => {
        console.error('Failed to save Gemini API key:', error);
      });
  };

  const setIdeogramApiKey = (key: string) => {
    console.log('Setting Ideogram API key:', key);
    setIdeogramApiKeyState(key);
    saveSettings({ ideogram_api_key: key })
      .then(result => {
        console.log('Ideogram API key saved successfully:', result);
      })
      .catch(error => {
        console.error('Failed to save Ideogram API key:', error);
      });
  };

  const setClipdropApiKey = (key: string) => {
    console.log('Setting ClipDrop API key:', key);
    setClipdropApiKeyState(key);
    saveSettings({ clipdrop_api_key: key })
      .then(result => {
        console.log('ClipDrop API key saved successfully:', result);
      })
      .catch(error => {
        console.error('Failed to save ClipDrop API key:', error);
      });
  };

  // Load API keys from settings when they change
  useEffect(() => {
    if (settings) {
      console.log('Loading API keys from settings:', settings);
      setGeminiApiKeyState(settings.gemini_api_key || "");
      setIdeogramApiKeyState(settings.ideogram_api_key || "");
      setClipdropApiKeyState(settings.clipdrop_api_key || "");
      setKeysLoaded(true);
    }
  }, [settings]);
  
  // Debug log when keys change
  useEffect(() => {
    console.log('API keys state updated:', { 
      geminiApiKey, 
      ideogramApiKey, 
      clipdropApiKey,
      keysLoaded 
    });
  }, [geminiApiKey, ideogramApiKey, clipdropApiKey, keysLoaded]);

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
