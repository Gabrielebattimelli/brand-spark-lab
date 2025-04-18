import React, { useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { generateBrandNames } from "@/integrations/ai/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface BrandNameGeneratorProps {
  industry: string;
  businessDescription: string;
  keywords: string[];
  onSelect: (name: string) => void;
}

export const BrandNameGenerator: React.FC<BrandNameGeneratorProps> = ({
  industry,
  businessDescription,
  keywords,
  onSelect,
}) => {
  const { 
    geminiApiKey,
    generatedBrandNames, 
    setGeneratedBrandNames,
    generatedBrandNamesWithExplanations,
    setGeneratedBrandNamesWithExplanations,
    selectedBrandName,
    setSelectedBrandName,
    isGeneratingText,
    setIsGeneratingText
  } = useAI();

  const [error, setError] = useState<string | null>(null);
  const [expandedNames, setExpandedNames] = useState<Record<string, boolean>>({});

  const toggleNameExpansion = (name: string) => {
    setExpandedNames(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleGenerateNames = async () => {
    if (!geminiApiKey) {
      setError("Gemini API key is required to generate brand names");
      return;
    }

    setError(null);
    setIsGeneratingText(true);

    try {
      const namesWithExplanations = await generateBrandNames(
        geminiApiKey,
        industry,
        businessDescription,
        keywords,
        8 // Generate 8 name options
      );

      // Extract just the names for the existing state
      const names = namesWithExplanations.map(item => item.name);
      setGeneratedBrandNames(names);
      setGeneratedBrandNamesWithExplanations(namesWithExplanations);

      // If no name is selected yet, select the first one
      if (!selectedBrandName && names.length > 0) {
        setSelectedBrandName(names[0]);
        onSelect(names[0]);
      }
    } catch (err) {
      console.error("Error generating brand names:", err);
      setError("Failed to generate brand names. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedBrandName(name);
    onSelect(name);
  };

  // Find explanation for a given name
  const getExplanationForName = (name: string): string => {
    const nameObj = generatedBrandNamesWithExplanations.find(item => item.name === name);
    return nameObj?.explanation || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Brand Name Ideas
        </CardTitle>
        <CardDescription>
          Generate creative brand name suggestions based on your business details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedBrandNames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-center text-gray-500 mb-4">
              Click the button below to generate brand name suggestions based on your business details
            </p>
            <Button 
              onClick={handleGenerateNames}
              disabled={isGeneratingText}
            >
              {isGeneratingText ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Brand Names
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {generatedBrandNames.map((name, index) => {
                const isExpanded = expandedNames[name] || false;
                const explanation = getExplanationForName(name);

                return (
                  <div
                    key={index}
                    className={`
                      p-3 rounded-md border transition-all
                      ${name === selectedBrandName 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-gray-200 hover:border-primary/50"}
                    `}
                  >
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => handleSelectName(name)}
                    >
                      <span className="font-medium text-lg">{name}</span>
                      <div className="flex items-center">
                        {name === selectedBrandName && (
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNameExpansion(name);
                          }}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && explanation && (
                      <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                        <p>{explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleGenerateNames}
                disabled={isGeneratingText}
              >
                {isGeneratingText ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate More Options
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          {selectedBrandName ? `Selected: ${selectedBrandName}` : "No name selected"}
        </p>
      </CardFooter>
    </Card>
  );
};
