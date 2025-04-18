
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { BusinessBasics } from "@/components/wizard/steps/BusinessBasics";
import { TargetAudience } from "@/components/wizard/steps/TargetAudience";
import { BrandPersonality } from "@/components/wizard/steps/BrandPersonality";
import { BrandStory } from "@/components/wizard/steps/BrandStory";
import { Competition } from "@/components/wizard/steps/Competition";
import { Aesthetics } from "@/components/wizard/steps/Aesthetics";
import { Results } from "@/components/wizard/steps/Results";

export default function BrandWizard() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentStep, setCurrentStep] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  
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
  });

  // For demo purposes, we'll just simulate step validation
  const [stepsValidity, setStepsValidity] = useState({
    basics: false,
    audience: false,
    personality: false,
    story: false,
    competition: false,
    aesthetics: false,
  });

  const updateFormData = (stepId: string, data: any) => {
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
        case "basics":
          setCurrentStep("audience");
          break;
        case "audience":
          setCurrentStep("personality");
          break;
        case "personality":
          setCurrentStep("story");
          break;
        case "story":
          setCurrentStep("competition");
          break;
        case "competition":
          setCurrentStep("aesthetics");
          break;
        case "aesthetics":
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
      case "audience":
        setCurrentStep("basics");
        break;
      case "personality":
        setCurrentStep("audience");
        break;
      case "story":
        setCurrentStep("personality");
        break;
      case "competition":
        setCurrentStep("story");
        break;
      case "aesthetics":
        setCurrentStep("competition");
        break;
      case "results":
        setCurrentStep("aesthetics");
        break;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
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
      case "story":
        return (
          <BrandStory 
            data={formData}
            onChange={(data) => updateFormData("story", data)}
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
      case "results":
        return (
          <Results 
            data={formData}
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
