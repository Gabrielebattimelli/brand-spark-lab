
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAI } from "@/contexts/AIContext";
import { useProjects } from "@/hooks/use-projects";
import { useProjectData, StepType } from "@/hooks/use-project-data";
import { useGeneratedAssets, AssetType } from "@/hooks/use-generated-assets";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { BusinessBasics } from "@/components/wizard/steps/BusinessBasics";
import { TargetAudience } from "@/components/wizard/steps/TargetAudience";
import { BrandPersonality } from "@/components/wizard/steps/BrandPersonality";
import { BrandStory } from "@/components/wizard/steps/BrandStory";
import { Competition } from "@/components/wizard/steps/Competition";
import { Aesthetics } from "@/components/wizard/steps/Aesthetics";
import { Results } from "@/components/wizard/steps/Results";
import { APIKeySetup } from "@/components/ai/APIKeySetup";
import { BrandNameGenerator } from "@/components/ai/BrandNameGenerator";
import { BrandStatementGenerator } from "@/components/ai/BrandStatementGenerator";
import { ColorPaletteGenerator } from "@/components/ai/ColorPaletteGenerator";
import { LogoGenerator } from "@/components/ai/LogoGenerator";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { toast } from "sonner";

export default function BrandWizard() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentStep, setCurrentStep] = useState("api-setup");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize hooks
  const { getProject } = useProjects();
  const { getStepData, saveStepData } = useProjectData(projectId);
  const { getAsset, saveAsset } = useGeneratedAssets(projectId);

  // Access AI context
  const { 
    selectedBrandName,
    selectedMissionStatement,
    selectedVisionStatement,
    selectedValueProposition,
    selectedBrandEssence,
    selectedBrandVoice,
    selectedColorPalette,
    selectedLogo,
    resetGeneratedContent
  } = useAI();

  // Load and store project data in state
  const [formData, setFormData] = useState({
    // Business Basics
    industry: "",
    businessName: "",
    productService: "",
    uniqueSellingProposition: "",

    // Target Audience
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

    // Brand Personality
    personalityTraits: {
      playfullnessVsSerious: 50, // Scale from 0-100
      modernVsTraditional: 50,
      luxuriousVsAccessible: 50,
      boldVsSubtle: 50,
      formalVsRelaxed: 50,
    },
    selectedArchetype: "",

    // Brand Story
    mission: "",
    vision: "",
    values: [],
    originStory: "",

    // Competition
    competitors: [],
    differentiators: [],

    // Aesthetics
    visualStyle: "",
    colorPreferences: [],
    inspirationKeywords: [],
    moodboardUrls: [],

    // AI Generated Content
    aiGenerated: {
      brandName: "",
      mission: "",
      vision: "",
      valueProposition: "",
      brandEssence: "",
      brandVoice: "",
      colorPalette: null as GeneratedColorPalette | null,
      logo: null as GeneratedLogo | null,
    }
  });

  // Load project data when component mounts
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        // Load project info
        const project = await getProject(projectId);
        if (project) {
          setFormData(prev => ({
            ...prev,
            industry: project.industry || "",
            businessName: project.name || ""
          }));
        }

        // Load step data
        const stepsToLoad: StepType[] = ['basics', 'audience', 'personality', 'story', 'competition', 'aesthetics', 'results'];
        for (const step of stepsToLoad) {
          const stepData = await getStepData(step);
          if (stepData) {
            setFormData(prev => ({
              ...prev,
              ...stepData
            }));

            // Mark step as valid
            setStepsValidity(prev => ({
              ...prev,
              [step]: true
            }));
          }
        }

        // Load generated assets
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

        for (const type of assetTypes) {
          const asset = await getAsset(type);
          if (asset) {
            switch (type) {
              case 'brand_name':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    brandName: asset.content
                  }
                }));
                setStepsValidity(prev => ({ ...prev, "ai-name": true }));
                break;
              case 'mission_statement':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    mission: asset.content
                  }
                }));
                break;
              case 'vision_statement':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    vision: asset.content
                  }
                }));
                break;
              case 'value_proposition':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    valueProposition: asset.content
                  }
                }));
                break;
              case 'brand_essence':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    brandEssence: asset.content
                  }
                }));
                break;
              case 'brand_voice':
                setFormData(prev => ({
                  ...prev,
                  aiGenerated: {
                    ...prev.aiGenerated,
                    brandVoice: asset.content
                  }
                }));
                setStepsValidity(prev => ({ ...prev, "ai-statements": true }));
                break;
              case 'color_palette':
                try {
                  const palette = JSON.parse(asset.content);
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
                }
                break;
              case 'logo':
                try {
                  const logo = JSON.parse(asset.content);
                  setFormData(prev => ({
                    ...prev,
                    aiGenerated: {
                      ...prev.aiGenerated,
                      logo
                    }
                  }));
                  setStepsValidity(prev => ({ ...prev, "ai-logo": true }));
                } catch (err) {
                  console.error('Failed to parse logo:', err);
                }
                break;
            }
          }
        }

        // Determine the starting step based on progress
        if (project && project.completion_percentage > 0) {
          // Find the first incomplete step
          for (const [step, isValid] of Object.entries(stepsValidity)) {
            if (!isValid) {
              setCurrentStep(step);
              break;
            }
          }
        }

      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, getProject, getStepData, getAsset]);

  // For validation of steps
  const [stepsValidity, setStepsValidity] = useState({
    "api-setup": false,
    basics: false,
    audience: false,
    personality: false,
    "ai-name": false,
    story: false,
    "ai-statements": false,
    competition: false,
    aesthetics: false,
    "ai-logo": false,
  });

  // Define a type for the form data to avoid using 'any'
  type FormDataUpdate = Partial<typeof formData>;

  const updateFormData = (stepId: string, data: FormDataUpdate) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));

    // Mark the step as valid
    setStepsValidity(prev => ({
      ...prev,
      [stepId]: true
    }));
  };

  const handleNext = async () => {
    if (!projectId) return;

    setIsSaving(true);

    try {
      // Save step data based on current step
      let success = false;

      // Prepare data objects outside switch to avoid ESLint warnings
      const basicsData = {
        industry: formData.industry,
        businessName: formData.businessName,
        productService: formData.productService,
        uniqueSellingProposition: formData.uniqueSellingProposition,
      };

      const audienceData = {
        demographics: formData.demographics,
        psychographics: formData.psychographics,
      };

      const personalityData = {
        personalityTraits: formData.personalityTraits,
        selectedArchetype: formData.selectedArchetype,
      };

      const storyData = {
        mission: formData.mission,
        vision: formData.vision,
        values: formData.values,
        originStory: formData.originStory,
      };

      const competitionData = {
        competitors: formData.competitors,
        differentiators: formData.differentiators,
      };

      const aestheticsData = {
        visualStyle: formData.visualStyle,
        colorPreferences: formData.colorPreferences,
        inspirationKeywords: formData.inspirationKeywords,
        moodboardUrls: formData.moodboardUrls,
      };

      const resultsData = {
        // Any final data to save
        completed: true
      };

      switch (currentStep) {
        case "api-setup":
          // No data to save for API setup
          success = true;
          break;
        case "basics":
          // Save basics data
          success = await saveStepData('basics', basicsData);
          break;
        case "audience":
          // Save audience data
          success = await saveStepData('audience', audienceData);
          break;
        case "personality":
          // Save personality data
          success = await saveStepData('personality', personalityData);
          break;
        case "ai-name":
          // Save brand name
          if (formData.aiGenerated.brandName) {
            await saveAsset('brand_name', formData.aiGenerated.brandName);
          }
          success = true;
          break;
        case "story":
          // Save story data
          success = await saveStepData('story', storyData);
          break;
        case "ai-statements":
          // Save AI generated statements
          if (formData.aiGenerated.mission) {
            await saveAsset('mission_statement', formData.aiGenerated.mission);
          }
          if (formData.aiGenerated.vision) {
            await saveAsset('vision_statement', formData.aiGenerated.vision);
          }
          if (formData.aiGenerated.valueProposition) {
            await saveAsset('value_proposition', formData.aiGenerated.valueProposition);
          }
          if (formData.aiGenerated.brandEssence) {
            await saveAsset('brand_essence', formData.aiGenerated.brandEssence);
          }
          if (formData.aiGenerated.brandVoice) {
            await saveAsset('brand_voice', formData.aiGenerated.brandVoice);
          }
          success = true;
          break;
        case "competition":
          // Save competition data
          success = await saveStepData('competition', competitionData);
          break;
        case "aesthetics":
          // Save aesthetics data
          success = await saveStepData('aesthetics', aestheticsData);

          // Save color palette if available
          if (formData.aiGenerated.colorPalette) {
            await saveAsset(
              'color_palette', 
              JSON.stringify(formData.aiGenerated.colorPalette)
            );
          }
          success = true;
          break;
        case "ai-logo":
          // Save logo if available
          if (formData.aiGenerated.logo) {
            await saveAsset(
              'logo', 
              JSON.stringify(formData.aiGenerated.logo)
            );
          }
          success = true;
          break;
        case "results":
          // Save results data
          success = await saveStepData('results', resultsData);
          break;
      }

      if (!success) {
        throw new Error('Failed to save data');
      }

      // Move to next step
      switch (currentStep) {
        case "api-setup":
          setCurrentStep("basics");
          break;
        case "basics":
          setCurrentStep("audience");
          break;
        case "audience":
          setCurrentStep("personality");
          break;
        case "personality":
          setCurrentStep("ai-name");
          break;
        case "ai-name":
          setCurrentStep("story");
          break;
        case "story":
          setCurrentStep("ai-statements");
          break;
        case "ai-statements":
          setCurrentStep("competition");
          break;
        case "competition":
          setCurrentStep("aesthetics");
          break;
        case "aesthetics":
          setCurrentStep("ai-logo");
          break;
        case "ai-logo":
          setCurrentStep("results");
          break;
        case "results":
          // Navigate to results/brand kit page
          navigate(`/projects/${projectId}/brand-kit`);
          break;
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevious = () => {
    switch (currentStep) {
      case "basics":
        setCurrentStep("api-setup");
        break;
      case "audience":
        setCurrentStep("basics");
        break;
      case "personality":
        setCurrentStep("audience");
        break;
      case "ai-name":
        setCurrentStep("personality");
        break;
      case "story":
        setCurrentStep("ai-name");
        break;
      case "ai-statements":
        setCurrentStep("story");
        break;
      case "competition":
        setCurrentStep("ai-statements");
        break;
      case "aesthetics":
        setCurrentStep("competition");
        break;
      case "ai-logo":
        setCurrentStep("aesthetics");
        break;
      case "results":
        setCurrentStep("ai-logo");
        break;
    }
  };

  // Handle AI-generated content updates
  const handleBrandNameSelect = async (name: string) => {
    setFormData(prev => ({
      ...prev,
      businessName: name,
      aiGenerated: {
        ...prev.aiGenerated,
        brandName: name
      }
    }));

    // Mark the step as valid
    setStepsValidity(prev => ({
      ...prev,
      "ai-name": true
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('brand_name', name);
      } catch (error) {
        console.error('Failed to save brand name:', error);
        toast.error('Failed to save brand name');
      }
    }
  };

  const handleMissionSelect = async (statement: string) => {
    setFormData(prev => ({
      ...prev,
      mission: statement,
      aiGenerated: {
        ...prev.aiGenerated,
        mission: statement
      }
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('mission_statement', statement);
      } catch (error) {
        console.error('Failed to save mission statement:', error);
        toast.error('Failed to save mission statement');
      }
    }
  };

  const handleVisionSelect = async (statement: string) => {
    setFormData(prev => ({
      ...prev,
      vision: statement,
      aiGenerated: {
        ...prev.aiGenerated,
        vision: statement
      }
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('vision_statement', statement);
      } catch (error) {
        console.error('Failed to save vision statement:', error);
        toast.error('Failed to save vision statement');
      }
    }
  };

  const handleValuePropositionSelect = async (statement: string) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        valueProposition: statement
      }
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('value_proposition', statement);
      } catch (error) {
        console.error('Failed to save value proposition:', error);
        toast.error('Failed to save value proposition');
      }
    }
  };

  const handleBrandEssenceSelect = async (statement: string) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        brandEssence: statement
      }
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('brand_essence', statement);
      } catch (error) {
        console.error('Failed to save brand essence:', error);
        toast.error('Failed to save brand essence');
      }
    }
  };

  const handleBrandVoiceSelect = async (statement: string) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        brandVoice: statement
      }
    }));

    // Mark the step as valid
    setStepsValidity(prev => ({
      ...prev,
      "ai-statements": true
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('brand_voice', statement);
      } catch (error) {
        console.error('Failed to save brand voice:', error);
        toast.error('Failed to save brand voice');
      }
    }
  };

  const handleColorPaletteSelect = async (palette: GeneratedColorPalette) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        colorPalette: palette
      }
    }));

    // Mark the step as valid
    setStepsValidity(prev => ({
      ...prev,
      "aesthetics": true
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('color_palette', JSON.stringify(palette));
      } catch (error) {
        console.error('Failed to save color palette:', error);
        toast.error('Failed to save color palette');
      }
    }
  };

  const handleLogoSelect = async (logo: GeneratedLogo) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        logo
      }
    }));

    // Mark the step as valid
    setStepsValidity(prev => ({
      ...prev,
      "ai-logo": true
    }));

    // Save to backend if we have a project ID
    if (projectId) {
      try {
        await saveAsset('logo', JSON.stringify(logo));
      } catch (error) {
        console.error('Failed to save logo:', error);
        toast.error('Failed to save logo');
      }
    }
  };

  const handleAPISetupComplete = () => {
    // Mark the API setup step as valid
    setStepsValidity(prev => ({
      ...prev,
      "api-setup": true
    }));
  };

  // Show loading indicator while data is being loaded
  if (isLoading) {
    return (
      <WizardLayout
        currentStep={currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        isNextDisabled={true}
        isPreviousDisabled={true}
        isSaving={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-lg">Loading project data...</p>
        </div>
      </WizardLayout>
    );
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "api-setup":
        return (
          <APIKeySetup onComplete={handleAPISetupComplete} />
        );
      case "basics":
        return (
          <BusinessBasics 
            data={formData}
            onChange={(data) => updateFormData("basics", data)}
          />
        );
      case "audience":
        return (
          <TargetAudience 
            data={formData}
            onChange={(data) => updateFormData("audience", data)}
          />
        );
      case "personality":
        return (
          <BrandPersonality 
            data={formData}
            onChange={(data) => updateFormData("personality", data)}
          />
        );
      case "ai-name":
        return (
          <BrandNameGenerator
            industry={formData.industry}
            businessDescription={formData.productService}
            keywords={formData.psychographics.interests || []}
            onSelect={handleBrandNameSelect}
          />
        );
      case "story":
        return (
          <BrandStory 
            data={formData}
            onChange={(data) => updateFormData("story", data)}
          />
        );
      case "ai-statements":
        return (
          <BrandStatementGenerator
            brandName={formData.businessName || selectedBrandName}
            industry={formData.industry}
            targetAudience={`${formData.demographics.ageRange} ${formData.demographics.gender} from ${formData.demographics.location}`}
            values={formData.values}
            uniqueSellingPoints={formData.differentiators}
            onSelectMission={handleMissionSelect}
            onSelectVision={handleVisionSelect}
            onSelectValueProposition={handleValuePropositionSelect}
            onSelectBrandEssence={handleBrandEssenceSelect}
            onSelectBrandVoice={handleBrandVoiceSelect}
          />
        );
      case "competition":
        return (
          <Competition 
            data={formData}
            onChange={(data) => updateFormData("competition", data)}
          />
        );
      case "aesthetics":
        return (
          <Aesthetics 
            data={formData}
            onChange={(data) => updateFormData("aesthetics", data)}
          />
        );
      case "ai-logo":
        return (
          <LogoGenerator
            brandName={formData.businessName || selectedBrandName}
            industry={formData.industry}
            brandPersonality={formData.selectedArchetype}
            onSelect={handleLogoSelect}
          />
        );
      case "results":
        return (
          <Results 
            data={{
              ...formData,
              brandName: formData.businessName || selectedBrandName,
              mission: formData.mission || selectedMissionStatement,
              vision: formData.vision || selectedVisionStatement,
              values: formData.values || [], // Explicitly pass values array
              valueProposition: selectedValueProposition,
              brandEssence: selectedBrandEssence,
              brandVoice: selectedBrandVoice,
              colorPalette: selectedColorPalette,
              logo: selectedLogo
            }}
          />
        );
      default:
        return <div>Step not found</div>;
    }
  };

  // Determine if we can proceed to the next step
  const canProceed = () => {
    // For demo purposes, we'll allow proceeding without validation
    return true;

    // In a real app, we would check the validity of the current step
    // return stepsValidity[currentStep as keyof typeof stepsValidity];
  };

  return (
    <WizardLayout
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canProceed={canProceed()}
      isLastStep={currentStep === "results"}
      isSaving={isSaving}
    >
      {renderStepContent()}
    </WizardLayout>
  );
}
