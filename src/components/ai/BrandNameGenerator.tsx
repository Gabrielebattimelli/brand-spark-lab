import React, { useState, useEffect } from "react";
import { useAI } from "@/contexts/AIContext";
import { useParams } from "react-router-dom";
import { useBrandNameStorage } from "@/hooks/use-brand-name-storage";
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
  const { projectId } = useParams<{ projectId?: string }>(); // Get the current project ID from the URL
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Use our brand name storage hook
  const { loadBrandNames, saveBrandNames } = useBrandNameStorage(projectId);

  const toggleNameExpansion = (name: string) => {
    setExpandedNames(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Initial load of brand names from the database
  useEffect(() => {
    if (!initialLoadComplete && projectId) {
      console.log('Loading brand names from Supabase for project:', projectId);
      
      const fetchBrandNames = async () => {
        try {
          // Fetch brand names without clearing existing ones first
          // This prevents the infinite update loop
          const { brandNames, brandNamesWithExplanations, selectedName } = await loadBrandNames();
          
          if (brandNamesWithExplanations.length > 0) {
            console.log(`Found ${brandNamesWithExplanations.length} stored brand names for project ${projectId}:`, brandNamesWithExplanations);
            
            // Verify these brand names belong to the current project
            // This is a safety check in case there's an issue with the database queries
            const belongsToCurrentProject = !brandNamesWithExplanations[0]?.projectId || 
                                           brandNamesWithExplanations[0].projectId === projectId;
            
            if (!belongsToCurrentProject) {
              console.error(`Brand names belong to project ${brandNamesWithExplanations[0].projectId}, not current project ${projectId}`);
              // Don't load these brand names as they belong to a different project
            } else {
              // Only update state if the brand names belong to the current project
              setGeneratedBrandNames(brandNames);
              setGeneratedBrandNamesWithExplanations(brandNamesWithExplanations);
              
              if (selectedName) {
                console.log(`Setting selected brand name for project ${projectId}:`, selectedName);
                setSelectedBrandName(selectedName);
                onSelect(selectedName);
              }
            }
          } else {
            console.log(`No brand names found for project ${projectId}`);
          }
        } catch (err) {
          console.error(`Error loading brand names for project ${projectId}:`, err);
        } finally {
          setInitialLoadComplete(true);
        }
      };
      
      fetchBrandNames();
    }
  }, [projectId, initialLoadComplete, loadBrandNames, setGeneratedBrandNames, setGeneratedBrandNamesWithExplanations, setSelectedBrandName, onSelect]);

  const handleGenerateNames = async () => {
    if (!geminiApiKey) {
      setError("Gemini API key is required to generate brand names");
      return;
    }

    setError(null);
    setIsGeneratingText(true);

    try {
      // Generate brand names without clearing existing ones first to prevent potential infinite loops
      const namesWithExplanations = await generateBrandNames(
        geminiApiKey,
        industry,
        businessDescription,
        keywords,
        8 // Generate 8 name options
      );

      // Add project ID to each brand name for additional verification
      const namesWithProjectId = namesWithExplanations.map(item => ({
        ...item,
        projectId: projectId // Store the project ID with each brand name
      }));

      // Extract just the names for the existing state
      const names = namesWithProjectId.map(item => item.name);
      
      // Update state with new brand names
      setGeneratedBrandNames(names);
      setGeneratedBrandNamesWithExplanations(namesWithProjectId);

      // Save to Supabase
      if (projectId) {
        console.log(`Saving brand names to Supabase for project ${projectId}`);
        await saveBrandNames(namesWithProjectId);
      }

      // If no name is selected yet, select the first one
      if (!selectedBrandName && names.length > 0) {
        setSelectedBrandName(names[0]);
        onSelect(names[0]);
      }
    } catch (err) {
      console.error(`Error generating brand names for project ${projectId}:`, err);
      setError("Failed to generate brand names. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedBrandName(name);
    onSelect(name);
    
    // Save the selected name to Supabase
    if (projectId && generatedBrandNamesWithExplanations.length > 0) {
      console.log(`Saving selected brand name to Supabase for project ${projectId}:`, name);
      
      // Ensure we're saving brand names with the current project ID
      const namesWithProjectId = generatedBrandNamesWithExplanations.map(item => ({
        ...item,
        projectId: projectId // Ensure project ID is set correctly
      }));
      
      saveBrandNames(namesWithProjectId, name);
    }
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
