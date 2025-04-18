
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAI } from "@/contexts/AIContext";
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

export default function BrandWizard() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentStep, setCurrentStep] = useState("api-setup");
  const [isSaving, setIsSaving] = useState(false);

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

  // This would be stored in context or state management in a real app
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

  // For demo purposes, we'll just simulate step validation
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
    "ai-palette": false,
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

  const handleNext = () => {
    setIsSaving(true);

    // Simulate saving data
    setTimeout(() => {
      setIsSaving(false);

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
          setCurrentStep("ai-palette");
          break;
      case "ai-palette":
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
    }, 1000);
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
      case "ai-palette":
        setCurrentStep("aesthetics");
        break;
      case "ai-logo":
        setCurrentStep("ai-palette");
        break;
      case "results":
        setCurrentStep("ai-logo");
        break;
    }
  };

  // Handle AI-generated content updates
  const handleBrandNameSelect = (name: string) => {
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
  };

  const handleMissionSelect = (statement: string) => {
    setFormData(prev => ({
      ...prev,
      mission: statement,
      aiGenerated: {
        ...prev.aiGenerated,
        mission: statement
      }
    }));
  };

  const handleVisionSelect = (statement: string) => {
    setFormData(prev => ({
      ...prev,
      vision: statement,
      aiGenerated: {
        ...prev.aiGenerated,
        vision: statement
      }
    }));
  };

  const handleValuePropositionSelect = (statement: string) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        valueProposition: statement
      }
    }));
  };

  const handleBrandEssenceSelect = (statement: string) => {
    setFormData(prev => ({
      ...prev,
      aiGenerated: {
        ...prev.aiGenerated,
        brandEssence: statement
      }
    }));
  };

  const handleBrandVoiceSelect = (statement: string) => {
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
  };

  const handleColorPaletteSelect = (palette: GeneratedColorPalette) => {
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
      "ai-palette": true
    }));
  };

  const handleLogoSelect = (logo: GeneratedLogo) => {
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
  };

  const handleAPISetupComplete = () => {
    // Mark the API setup step as valid
    setStepsValidity(prev => ({
      ...prev,
      "api-setup": true
    }));
  };

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
      case "ai-palette":
        return (
          <ColorPaletteGenerator
            brandName={formData.businessName || selectedBrandName}
            industry={formData.industry}
            brandPersonality={formData.selectedArchetype}
            onSelect={handleColorPaletteSelect}
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
