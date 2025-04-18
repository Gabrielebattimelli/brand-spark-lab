import React from 'react';
import { BrandNameGenerator } from '@/components/ai/BrandNameGenerator';
import { FormData } from '@/pages/projects/BrandWizard';
import { useAI } from '@/contexts/AIContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BrandNameGeneratorStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const BrandNameGeneratorStep: React.FC<BrandNameGeneratorStepProps> = ({ data, onChange }) => {
  const { geminiApiKey } = useAI();

  const handleNameSelect = (name: string) => {
    onChange({ brandName: name });
  };

  if (!geminiApiKey) {
    return (
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Generate Brand Names</h1>
          <p className="text-gray-600">
            Let's generate some unique and memorable brand name ideas based on your business details.
          </p>
        </div>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Gemini API key is required to generate brand names. Please go back to the API Setup step to configure your API key.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Generate Brand Names</h1>
        <p className="text-gray-600">
          Let's generate some unique and memorable brand name ideas based on your business details.
        </p>
      </div>

      <BrandNameGenerator
        industry={data.industry}
        businessDescription={data.productService}
        keywords={[data.industry, ...data.productService.split(' ')]}
        onSelect={handleNameSelect}
      />
    </div>
  );
}; 