
import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

interface WizardStep {
  id: string;
  title: string;
  completed: boolean;
}

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: string;
  onNext: () => void;
  onPrevious: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
  isSaving?: boolean;
}

export const WizardLayout = ({
  children,
  currentStep,
  onNext,
  onPrevious,
  canProceed = true,
  isLastStep = false,
  isSaving = false,
}: WizardLayoutProps) => {
  const navigate = useNavigate();

  // These steps would typically come from a context or prop
  const [steps] = useState<WizardStep[]>([
    { id: "api-setup", title: "API Setup", completed: true },
    { id: "basics", title: "Business Basics", completed: false },
    { id: "audience", title: "Target Audience", completed: false },
    { id: "personality", title: "Brand Personality", completed: false },
    { id: "ai-name", title: "AI Brand Name", completed: false },
    { id: "story", title: "Brand Story & Values", completed: false },
    { id: "ai-statements", title: "AI Brand Statements", completed: false },
    { id: "competition", title: "Competitive Landscape", completed: false },
    { id: "aesthetics", title: "Mood & Aesthetics", completed: false },
    { id: "ai-logo", title: "AI Logo Generation", completed: false },
    { id: "results", title: "Results & Brand Kit", completed: false },
  ]);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          ></div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Step indicators */}
          <div className="hidden md:flex items-center justify-between mb-10 px-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index < currentStepIndex
                      ? "bg-primary text-white"
                      : index === currentStepIndex
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle size={18} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    index === currentStepIndex
                      ? "text-primary"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden mb-6">
            <p className="text-sm font-medium text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              {steps[currentStepIndex].title}
            </h2>
          </div>

          {/* Wizard content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">
            {children}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>

            <Button
              onClick={onNext}
              disabled={!canProceed || isSaving}
            >
              {isSaving ? (
                <>
                  <Save size={16} className="mr-2 animate-pulse" />
                  Saving...
                </>
              ) : isLastStep ? (
                "Complete"
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
