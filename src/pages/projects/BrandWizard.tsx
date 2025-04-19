import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAI } from "@/contexts/AIContext";
import { useProjects } from "@/hooks/use-projects";
import { useProjectData, StepType, FormDataType } from "@/hooks/use-project-data";
import { useGeneratedAssets, AssetType } from "@/hooks/use-generated-assets";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { BusinessBasics } from "@/components/wizard/steps/BusinessBasics";
import { TargetAudience } from "@/components/wizard/steps/TargetAudience";
import { BrandPersonality, PersonalityTrait } from "@/components/wizard/steps/BrandPersonality";
import { BrandStory } from "@/components/wizard/steps/BrandStory";
import { Competition } from "@/components/wizard/steps/Competition";
import { Aesthetics } from "@/components/wizard/steps/Aesthetics";
import { LogoGeneration } from "@/components/wizard/steps/LogoGeneration";
import { Results } from "@/components/wizard/steps/Results";
// APIKeySetup import removed
import { BrandNameGenerator } from "@/components/ai/BrandNameGenerator";
import { BrandStatementGenerator } from "@/components/ai/BrandStatementGenerator";
import { ColorPaletteGenerator } from "@/components/ai/ColorPaletteGenerator";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { toast } from "sonner";
import { BrandNameGeneratorStep } from "@/components/wizard/steps/BrandNameGeneratorStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Define the form data type
export interface FormData extends FormDataType {
  industry: string;
  businessName: string;
  productService: string;
  uniqueSellingProposition: string;

  demographics: {  
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    painPoints: string[];
    goals: string[];
  };

  personalityTraits: PersonalityTrait[];

  selectedArchetype: string;
  
  mission: string;
  vision: string;
  values: string[];
  originStory: string;

  competitors: Array<{
    name: string;
    strengths: string;
    weaknesses: string;
  }>;
  differentiators: string[];

  visualStyle: string;
  colorPreferences: string[];
  inspirationKeywords: string[];
  moodboardUrls: string[];
  logo: GeneratedLogo | null;
  brandName: string;

  aiGenerated: {
    brandName: string;
    mission: string;
    vision: string;
    valueProposition: string;
    brandEssence: string;
    brandVoice: string;
    colorPalette: GeneratedColorPalette | null;
    logo: GeneratedLogo | null;
  };
}

// Define the steps in order
const STEPS: string[] = [
  'basics',
  'brand-name-generator',
  'audience',
  'personality',
  'story',
  'competition',
  'aesthetics',
  'logo',
  'results'
];

// Define the initial form data
const INITIAL_FORM_DATA: FormData = {
  industry: "",
  businessName: "",
  productService: "",
  uniqueSellingProposition: "",

  demographics: {
    ageRange: "",
    gender: "",
    location: "",
    income: "",
    education: "",
  },
  psychographics: {
    interests: [],
    values: [],
    painPoints: [],
    goals: [],
  },

  personalityTraits: [
    { label: "Playfulness vs. Seriousness", value: 50 },
    { label: "Modern vs. Traditional", value: 50 },
    { label: "Luxurious vs. Accessible", value: 50 },
    { label: "Bold vs. Subtle", value: 50 },
    { label: "Formal vs. Relaxed", value: 50 },
  ],
  
  

  selectedArchetype: "",

  mission: "",
  vision: "",
  values: [],
  originStory: "",

  competitors: [],
  differentiators: [],

  visualStyle: "",
  colorPreferences: [],
  inspirationKeywords: [],
  moodboardUrls: [],

  brandName: "",
  logo: null,

  aiGenerated: {
    brandName: "",
    mission: "",
    vision: "",
    valueProposition: "",
    brandEssence: "",
    brandVoice: "",
    colorPalette: null,
    logo: null,
  }
};

// Update the component props interfaces
interface BusinessBasicsProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface TargetAudienceProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface BrandPersonalityProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface BrandStoryProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface CompetitionProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface AestheticsProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

interface WizardLayoutProps {
  currentStep: string;
  onNext: () => Promise<void>;
  onPrevious: () => void;
  canProceed: boolean;
  isSaving: boolean;
  children: React.ReactNode;
}

export default function BrandWizard() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentStep, setCurrentStep] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [stepsValidity, setStepsValidity] = useState<Record<string, boolean>>({});

  // Initialize hooks
  const { getProject } = useProjects();
  const { getStepData, saveStepData } = useProjectData(projectId);
  const { getAsset, saveAsset } = useGeneratedAssets(projectId);

  // Access AI context
  const { 
    geminiApiKey,
    ideogramApiKey,
    clipdropApiKey,
    selectedBrandName,
    selectedMissionStatement,
    selectedVisionStatement,
    selectedValueProposition,
    selectedBrandEssence,
    selectedBrandVoice,
    selectedColorPalette,
    selectedLogo,
    setSelectedLogo,
    resetGeneratedContent
  } = useAI();

  // Check if API keys are set, if not redirect to settings
  useEffect(() => {
    if (!geminiApiKey || (!ideogramApiKey && !clipdropApiKey)) {
      toast.error("API keys are required to use the brand wizard. Please set them in Settings.");
      navigate("/settings");
      return;
    }
  }, [geminiApiKey, ideogramApiKey, clipdropApiKey, navigate, toast]);

  // Load project data when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        // Load project info first
        const project = await getProject(projectId);
        if (!project) {
          toast.error("Project not found");
          navigate("/dashboard");
          return;
        }

        setFormData(prev => ({
          ...prev,
          industry: project.industry || "",
          businessName: project.name || ""
        }));

        // For new projects (completion_percentage = 0), set to first step
        if (project.completion_percentage === 0) {
          setCurrentStep("basics");
          setIsLoading(false);
          return;
        }

        // Load step data in parallel to improve performance
        
        const stepsToLoad: StepType[] = ['basics', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'results'];
        let accumulatedStepData: Partial<FormData> = {};
        const stepDataPromises = stepsToLoad.map(async (step) => {
          try {
            const stepData = await getStepData(step);
            if (stepData && typeof stepData === 'object' && Object.keys(stepData).length > 0) {
              //Accumulate step data
              accumulatedStepData = {
                ...accumulatedStepData,
                ...(stepData as Partial<FormData>),
              };
              setStepsValidity(prev => ({
                ...prev,
                [step]: true
              }));
            }
          } catch (error) {
            console.error(`Error loading step ${step}:`, error);
            toast.error(`Failed to load ${step} data`);
          }
        });

        // Load assets in parallel
        const assetTypes: AssetType[] = [
          'brand_name', 
          'mission_statement', 
          'vision_statement', 
          'value_proposition', 
          'brand_essence', 
          'brand_voice', 
          'color_palette', 
          'logo'
        ];

        const assetPromises = assetTypes.map(async (type) => {
          try {
            const asset = await getAsset(type);
            if (asset) {
              const content = asset.content;
              switch (type) {
                case 'brand_name':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      brandName: content
                    }
                  }));
                  setStepsValidity(prev => ({ ...prev, "ai-name": true }));
                  break;
                case 'mission_statement':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      mission: content
                    }
                  }));
                  break;
                case 'vision_statement':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      vision: content
                    }
                  }));
                  break;
                case 'value_proposition':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      valueProposition: content
                    }
                  }));
                  break;
                case 'brand_essence':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      brandEssence: content
                    }
                  }));
                  break;
                case 'brand_voice':
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      brandVoice: content
                    }
                  }));
                  break;
                case 'color_palette':
                  try {
                    const palette = JSON.parse(content) as GeneratedColorPalette;
                    setFormData(prev => ({
                      ...prev,
                      aiGenerated: {
                        ...prev.aiGenerated,
                        colorPalette: palette
                      }
                    }));
                    setStepsValidity(prev => ({ ...prev, "aesthetics": true }));
                  } catch (err) {
                    console.error('Failed to parse color palette:', err);
                    toast.error('Failed to load color palette');
                  }
                  break;
                case 'logo':
                  try {
                    // Verify this logo belongs to the current project
                    if (asset.metadata && typeof asset.metadata === 'object' && 'projectId' in asset.metadata) {
                      const assetProjectId = String(asset.metadata.projectId);
                      
                      if (assetProjectId !== projectId) {
                        console.error(`Logo belongs to project ${assetProjectId}, not current project ${projectId}`);
                        // Don't load this logo as it belongs to a different project
                        break;
                      }
                    }
                    
                    const logo = JSON.parse(content) as GeneratedLogo;
                    console.log(`Successfully loaded logo for project ${projectId}:`, logo.url);
                    
                    // Store the logo in both the main form data
                    setFormData(prev => ({
                      ...prev,
                      logo: logo, // Store in main form data
                      aiGenerated: {
                        ...prev.aiGenerated,
                        logo: logo // Store in AI generated section
                      }
                    }));
                    
                    // Set the logo step as valid
                    setStepsValidity(prev => ({ ...prev, "logo": true }));
                    
                    // Also update the selected logo in the AI context
                    setSelectedLogo(logo);
                  } catch (err) {
                    console.error(`Failed to parse logo for project ${projectId}:`, err);
                    toast.error('Failed to load logo');
                  }
                  break;
              }
            }
          } catch (error) {
            console.error(`Error loading asset ${type}:`, error);
            toast.error(`Failed to load ${type}`);
          }
        });

        await Promise.all([...stepDataPromises, ...assetPromises]);
        // Apply accumulated step data
        setFormData(prev => ({ ...prev, ...accumulatedStepData }));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
        navigate("/dashboard");
      }
    };

    loadProjectData();
  }, [projectId, getProject, getStepData, getAsset, navigate]);

  const updateFormData = useCallback(async (step: string, data: Partial<FormData>, forceSave: boolean = false) => {
    // Update form data in state
    setFormData((prev) => ({
      ...prev,
      ...data
    }));
    

    setStepsValidity(prev => ({
      ...prev,
      [step]: true
    }));
    
    // Optionally immediately save to database (for aesthetic preferences that need to persist)
    if (forceSave && projectId) {
      console.log('Force saving step data for', step);
      setIsSaving(true);
      try {
        // First get current form data
        const currentFormData = { ...formData, ...data };
        const { aiGenerated, ...stepData } = currentFormData;
        await saveStepData(step as StepType, stepData);
        console.log('Successfully force saved step data for', step);
      } catch (error) {
        console.error('Error force saving step data:', error);
        toast.error('Failed to save preference changes');
      } finally {
        setIsSaving(false);
      }
    }
  }, [projectId, saveStepData, formData]);

  const handleNext = useCallback(async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      // Save current step data
      if (currentStep !== 'results') {
        // Create a clean step data object without AI generated content
        const { aiGenerated, ...stepData } = formData;
        
        // Convert the data to the correct format for the current step
        let stepDataToSave: any = { ...stepData }; // Spread operator to create a copy
        if (currentStep === 'logo') {
          stepDataToSave = {
            logo: formData.logo || formData.aiGenerated?.logo
          };
        }

        await saveStepData(currentStep as StepType, stepDataToSave);

      }

      // Move to next step
      const currentIndex = STEPS.indexOf(currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      toast.error('Failed to save step data');
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, formData, projectId, saveStepData]);

  const handlePrevious = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleBrandNameSelect = useCallback(async (name: string) => {
    if (!projectId) return;

    try {
      await saveAsset('brand_name', name);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          brandName: name
        }
      }));
      setStepsValidity(prev => ({ ...prev, "ai-name": true }));
      toast.success('Brand name saved successfully');
    } catch (error) {
      console.error('Error saving brand name:', error);
      toast.error('Failed to save brand name');
    }
  }, [projectId, saveAsset]);

  const handleMissionSelect = useCallback(async (statement: string) => {
    if (!projectId) return;

    try {
      await saveAsset('mission_statement', statement);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          mission: statement
        }
      }));
      toast.success('Mission statement saved successfully');
    } catch (error) {
      console.error('Error saving mission statement:', error);
      toast.error('Failed to save mission statement');
    }
  }, [projectId, saveAsset]);

  const handleVisionSelect = useCallback(async (statement: string) => {
    if (!projectId) return;

    try {
      await saveAsset('vision_statement', statement);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          vision: statement
        }
      }));
      toast.success('Vision statement saved successfully');
    } catch (error) {
      console.error('Error saving vision statement:', error);
      toast.error('Failed to save vision statement');
    }
  }, [projectId, saveAsset]);

  const handleValuePropositionSelect = useCallback(async (statement: string) => {
    if (!projectId) return;

    try {
      await saveAsset('value_proposition', statement);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          valueProposition: statement
        }
      }));
      toast.success('Value proposition saved successfully');
    } catch (error) {
      console.error('Error saving value proposition:', error);
      toast.error('Failed to save value proposition');
    }
  }, [projectId, saveAsset]);

  const handleBrandEssenceSelect = useCallback(async (statement: string) => {
    if (!projectId) return;

    try {
      await saveAsset('brand_essence', statement);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          brandEssence: statement
        }
      }));
      toast.success('Brand essence saved successfully');
    } catch (error) {
      console.error('Error saving brand essence:', error);
      toast.error('Failed to save brand essence');
    }
  }, [projectId, saveAsset]);

  const handleBrandVoiceSelect = useCallback(async (statement: string) => {
    if (!projectId) return;

    try {
      await saveAsset('brand_voice', statement);
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          brandVoice: statement
        }
      }));
      toast.success('Brand voice saved successfully');
    } catch (error) {
      console.error('Error saving brand voice:', error);
      toast.error('Failed to save brand voice');
    }
  }, [projectId, saveAsset]);

  const handleColorPaletteSelect = useCallback(async (palette: GeneratedColorPalette) => {
    if (!projectId) return;

    try {
      await saveAsset('color_palette', JSON.stringify(palette));
      setFormData(prev => ({
        ...prev,
        aiGenerated: {
          ...prev.aiGenerated,
          colorPalette: palette
        }
      }));
      setStepsValidity(prev => ({ ...prev, "aesthetics": true }));
      toast.success('Color palette saved successfully');
    } catch (error) {
      console.error('Error saving color palette:', error);
      toast.error('Failed to save color palette');
    }
  }, [projectId, saveAsset]);

  const handleLogoSelect = useCallback(async (logo: GeneratedLogo) => {
    if (!projectId) return;

    try {
      // Add project ID to the metadata for proper filtering
      const metadata = {
        projectId: projectId,
        timestamp: new Date().toISOString()
      };
      
      console.log(`Saving logo for project ${projectId}:`, logo.url);
      await saveAsset('logo', JSON.stringify(logo), metadata);
      
      // Update both the main form data and the AI generated section
      setFormData(prev => ({
        ...prev,
        logo: logo, // Store in main form data
        aiGenerated: {
          ...prev.aiGenerated,
          logo: logo // Store in AI generated section
        }
      }));
      
      // Set the logo step as valid
      setStepsValidity(prev => ({ ...prev, "logo": true }));
      
      toast.success('Logo saved successfully');
    } catch (error) {
      console.error(`Error saving logo for project ${projectId}:`, error);
      toast.error('Failed to save logo');
    }
  }, [projectId, saveAsset]);



  const canProceed = useCallback(() => {
    switch (currentStep) {

      case 'basics':
        return !!formData.industry && !!formData.businessName && !!formData.productService;
      case 'brand-name-generator':
        return !!formData.brandName;
      case 'audience':
        return Object.values(formData.demographics).some(v => v) && 
               Object.values(formData.psychographics).some(v => v.length > 0);
      case 'personality':
        return !!formData.selectedArchetype;
      case 'story': 
        return !!formData.mission && !!formData.vision && formData.values.length > 0;
      case 'competition':
        return formData.competitors.length > 0 && formData.differentiators.length > 0;
      case 'aesthetics':
        return !!formData.visualStyle ;
      case 'results':
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const renderStepContent = useCallback(() => {
    if (isLoading) {

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        </div>
      );
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    switch (currentStep) {

      case 'basics':
        return (
          <BusinessBasics
            data={formData}
            onChange={(data) => updateFormData('basics', data)}
          />
        );
      case 'brand-name-generator':
        return (
          <BrandNameGeneratorStep
            data={formData}
            onChange={(data) => updateFormData('brand-name-generator', data)}
          />
        );
      case 'audience':
        return (
          <TargetAudience
            data={formData}
            onChange={(data) => updateFormData('audience', data)}
          />
        );
      case 'personality':
        return (
          <BrandPersonality
            data={formData}
            onChange={(data) => updateFormData('personality', data)}
          />
        );
      case 'story':
        return (
          <BrandStory
            data={formData}
            onChange={(data) => updateFormData('story', data)}
          />
        );
      case 'competition':
        return (
          <Competition
            data={formData}
            onChange={(data) => updateFormData('competition', data)}
          />
        );
      case 'aesthetics':
        return (
          <Aesthetics
            data={formData}
            onChange={(data, forceSave = false) => updateFormData('aesthetics', data, forceSave)}
          />
        );
      case 'logo':
        return (
          <LogoGeneration
            data={formData}
            onChange={(data) => updateFormData('logo', data)}
            getAsset={getAsset}
            saveAsset={saveAsset}
            projectId={projectId}
          />
        );
      case 'results':
        return <Results data={formData} />;
      default:
        return null;
    }
  }, [currentStep, formData, isLoading, updateFormData]);

  return (
    <WizardLayout
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canProceed={canProceed()}
      isSaving={isSaving}
      header={
          <Button variant={"ghost"} className="flex gap-2" onClick={handlePrevious} disabled={STEPS.indexOf(currentStep) === 0 || isSaving}>
            <ArrowLeft className="h-4 w-4" />
            {STEPS.indexOf(currentStep) === 0 ? 'Start' : 'Back'}
          </Button>

      }
    >
      {renderStepContent()}
    </WizardLayout>
  );
}
