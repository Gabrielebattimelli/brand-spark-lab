import React, { useState, useEffect } from "react";
import { useAI } from "@/contexts/AIContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateLogoConcepts } from "../../../integrations/ai/logoGeneration";
import { GeneratedLogo } from "../../../types/logo";
import { GeneratedColorPalette } from "../../../integrations/ai/colorPalette";

interface LogoGenerationData {
  brandName: string;
  industry: string;
  productService: string;
  mission: string;
  vision: string;
  values: string[];
  valueProposition?: string;
  brandEssence?: string;
  brandVoice?: string;
  visualStyle: string;
  colorPreferences: string[];
  inspirationKeywords: string[];
  moodboardUrls: string[];
  demographics?: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    education: string;
  };
  logo: GeneratedLogo | null;
  aiGenerated?: {
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

interface LogoGenerationProps {
  data: LogoGenerationData;
  onChange: (data: Partial<LogoGenerationData>) => void;
  getAsset?: (type: string) => Promise<any>;
  saveAsset?: (type: string, content: string, metadata?: any) => Promise<any>;
  projectId?: string;
}

export const LogoGeneration = ({ data, onChange, getAsset, saveAsset, projectId }: LogoGenerationProps) => {
  const { 
    ideogramApiKey,
    clipdropApiKey,
    generatedLogos, 
    setGeneratedLogos,
    selectedLogo,
    setSelectedLogo,
    isGeneratingLogos,
    setIsGeneratingLogos
  } = useAI();

  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Initialize with previously saved logo data
  useEffect(() => {
    const initializeLogos = async () => {
      try {
        // Skip if already initialized or no project ID
        if (initialized || !projectId) {
          return;
        }
        
        // Skip if we already have logos in the state
        if (generatedLogos && generatedLogos.length > 0) {
          setInitialized(true);
          return;
        }
        
        let logosLoaded = false;
        let loadedLogos = [];
        let selectedLogoFromAssets = null;
        
        // If we have getAsset function, try to load from assets
        if (getAsset) {
          try {
            // First try to get all logos from the 'logos' asset
            const allLogosAsset = await getAsset('logos');
            
            if (allLogosAsset && allLogosAsset.content) {
              try {
                const allLogosContent = JSON.parse(allLogosAsset.content);
                
                if (allLogosContent && allLogosContent.logos && Array.isArray(allLogosContent.logos) && allLogosContent.logos.length > 0) {
                  // Ensure each logo has a unique ID
                  const uniqueLogos = allLogosContent.logos.filter((logo, index, self) => 
                    index === self.findIndex(l => l.id === logo.id)
                  );
                  
                  // Find the selected logo
                  const selectedLogoId = allLogosContent.selectedLogoId;
                  selectedLogoFromAssets = uniqueLogos.find(logo => logo.id === selectedLogoId) || uniqueLogos[0];
                  
                  // Store the loaded logos
                  loadedLogos = uniqueLogos;
                  logosLoaded = true;
                  
                  // Log success
                  toast({
                    title: "Logos Loaded",
                    description: `Successfully loaded ${uniqueLogos.length} logo concepts.`,
                    variant: "default",
                  });
                }
              } catch (parseError) {
                // Silent error - just continue to next method
              }
            }
            
            // If we couldn't load from the 'logos' asset, try to get individual logo assets
            if (!logosLoaded) {
              // Try to get the single logo asset for backward compatibility
              const asset = await getAsset('logo');
              if (asset && asset.content) {
                try {
                  const logoContent = JSON.parse(asset.content);
                  
                  if (logoContent && logoContent.url) {
                    // Add this logo to our collection
                    loadedLogos = [logoContent];
                    selectedLogoFromAssets = logoContent;
                    logosLoaded = true;
                  }
                } catch (parseError) {
                  // Silent error - just continue to next method
                }
              }
            }
            
            // If we still don't have logos, check if there's one in the project data
            if (!logosLoaded) {
              const savedLogo = data.logo || (data.aiGenerated && data.aiGenerated.logo);
              
              if (savedLogo && savedLogo.url) {
                // Add this logo to our collection
                loadedLogos = [savedLogo];
                selectedLogoFromAssets = savedLogo;
                logosLoaded = true;
              }
            }
            
            // If we have loaded logos, update the state
            if (logosLoaded && loadedLogos.length > 0) {
              // Initialize the generated logos with all saved logos
              setGeneratedLogos(loadedLogos);
              
              // Set the selected logo
              if (selectedLogoFromAssets) {
                setSelectedLogo(selectedLogoFromAssets);
                
                // Update project data with the selected logo
                onChange({
                  logo: selectedLogoFromAssets,
                  aiGenerated: {
                    ...data.aiGenerated,
                    logo: selectedLogoFromAssets
                  }
                });
              }
            }
          } catch (assetError) {
            // Silent error - just continue
            toast({
              title: "Warning",
              description: "Could not load all previously generated logos.",
              variant: "destructive",
            });
          }
        }
        
        setInitialized(true);
      } catch (error) {
        // Silent error - just mark as initialized
        setInitialized(true);
        toast({
          title: "Error",
          description: "Failed to initialize logos.",
          variant: "destructive",
        });
      }
    };

    initializeLogos();
  }, [data, getAsset, projectId, initialized, generatedLogos, setGeneratedLogos, setSelectedLogo, onChange]);

  const handleGenerateLogos = async () => {
    if (!ideogramApiKey && !clipdropApiKey) {
      setError("An API key is required to generate logos");
      return;
    }

    const brandName = data.brandName || data.aiGenerated?.brandName;
    if (!brandName) {
      setError("Brand name is required to generate logos");
      return;
    }

    setError(null);
    setIsGeneratingLogos(true);
    setLoading(true);
    
    // Keep existing logos - don't clear them
    // We'll append the new logos to the existing ones

    try {
      const params = {
        brandName,
        industry: data.industry || "General",
        brandPersonality: data.brandVoice || "professional and modern",
        aestheticPreferences: data.inspirationKeywords || [],
        colorPreferences: data.colorPreferences || []
      };
      
      // Add a timestamp to ensure we get fresh results
      params.brandPersonality += ` (${Date.now()})`;
      
      const newLogos = await generateLogoConcepts(
        ideogramApiKey || clipdropApiKey,
        params,
        4
      );
      
      // Ensure each new logo has a unique ID with a timestamp
      const timestamp = Date.now();
      const updatedNewLogos = newLogos.map((logo, index) => ({
        ...logo,
        id: `logo-${timestamp}-${index}`,
        selected: generatedLogos.length === 0 && index === 0
      }));
      
      // Combine existing logos with new ones
      const allLogos = [...generatedLogos, ...updatedNewLogos];
      
      // Ensure all logos have unique IDs
      const uniqueLogos = allLogos.filter((logo, index, self) => 
        index === self.findIndex(l => l.id === logo.id)
      );
      
      // Set the combined logos
      setGeneratedLogos(uniqueLogos);
      
      // Only set selected logo if none is currently selected
      if (!selectedLogo && updatedNewLogos.length > 0) {
        setSelectedLogo(updatedNewLogos[0]);
        
        // Update project data with the selected logo
        onChange({
          logo: updatedNewLogos[0],
          aiGenerated: {
            ...data.aiGenerated,
            logo: updatedNewLogos[0]
          }
        });
      }

      // Save all logos to generated assets
      if (typeof saveAsset === 'function') {
        try {
          // Save all logos with metadata
          const allLogosData = {
            logos: uniqueLogos,
            selectedLogoId: selectedLogo ? selectedLogo.id : (updatedNewLogos.length > 0 ? updatedNewLogos[0].id : null),
            timestamp: Date.now() // Add timestamp for versioning
          };
          
          // Save with project ID in metadata for security
          await saveAsset('logos', JSON.stringify(allLogosData), {
            projectId: projectId,
            count: uniqueLogos.length
          });
          
          // Also save the selected logo separately for backward compatibility
          if (selectedLogo || (updatedNewLogos.length > 0)) {
            const logoToSave = selectedLogo || updatedNewLogos[0];
            const logoData = {
              id: logoToSave.id,
              url: logoToSave.url,
              prompt: logoToSave.prompt,
              selected: true,
              timestamp: Date.now()
            };
            
            await saveAsset('logo', JSON.stringify(logoData), {
              projectId: projectId
            });
          }
          
          // Log success with count
          toast({
            title: "Logos Saved",
            description: `Successfully saved ${uniqueLogos.length} logo concepts.`,
            variant: "default",
          });
        } catch (error) {
          // Show error toast
          toast({
            title: "Warning",
            description: "Generated logos may not have been saved properly.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Logos Generated",
        description: "Successfully generated new logo concepts for your brand.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate logos";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLogos(false);
      setLoading(false);
    }
  };

  const handleSelectLogo = async (logo: GeneratedLogo) => {
    // Update the selected state for all logos
    const updatedLogos = generatedLogos.map(l => ({
      ...l,
      selected: l.id === logo.id
    }));
    
    // Update state
    setGeneratedLogos(updatedLogos);
    setSelectedLogo({...logo, selected: true});
    
    // Update project data
    const updatedData = { 
      logo: {...logo, selected: true},
      aiGenerated: {
        ...data.aiGenerated,
        logo: {...logo, selected: true}
      }
    };
    
    onChange(updatedData);

    // Save to generated assets when a logo is selected
    if (typeof saveAsset === 'function' && projectId) {
      try {
        // Save all logos with updated selection status and timestamp
        const allLogosData = {
          logos: updatedLogos,
          selectedLogoId: logo.id,
          timestamp: Date.now() // Add timestamp for versioning
        };
        
        // Save with project ID and count in metadata
        await saveAsset('logos', JSON.stringify(allLogosData), {
          projectId: projectId,
          count: updatedLogos.length,
          selectedId: logo.id
        });
        
        // Also save the selected logo separately for backward compatibility
        const logoData = {
          id: logo.id,
          url: logo.url,
          prompt: logo.prompt,
          selected: true,
          timestamp: Date.now()
        };
        
        await saveAsset('logo', JSON.stringify(logoData), {
          projectId: projectId
        });
        
        // Show success toast
        toast({
          title: "Logo Selected",
          description: `Your logo selection has been saved. All ${updatedLogos.length} logos preserved.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save your logo selection.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Logo Generation</h1>
        <p className="text-gray-600">
          Generate and customize your brand's logo using AI.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Logo Concepts</CardTitle>
          <CardDescription>
            Generate logo concepts based on your brand details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mb-6">
            <Button 
              onClick={handleGenerateLogos}
              disabled={isGeneratingLogos || loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Logo Concepts
                </>
              )}
            </Button>
          </div>
          
          {!generatedLogos || generatedLogos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center p-6">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Logo Generated Yet</h3>
                <p className="text-gray-500 mb-4">
                  Click the button above to generate logo concepts based on your brand details.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Generated Logos</h3>
              <p className="text-gray-500 mb-4">
                Click on a logo to select it as your brand logo. Generate more logos to add to your collection.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedLogos.map((logo, index) => {
                  // Ensure each logo has an ID
                  const logoId = logo.id || `logo-fallback-${index}`;
                  const isSelected = selectedLogo?.id === logoId;
                  
                  return (
                    <div
                      key={logoId}
                      className={`
                        relative border rounded-lg overflow-hidden cursor-pointer transition-all
                        ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"}
                      `}
                      onClick={() => handleSelectLogo({...logo, id: logoId})}
                    >
                      <div className="bg-white p-4 flex items-center justify-center min-h-[200px]">
                        <img
                          src={logo.url}
                          alt={`Logo concept ${index + 1}`}
                          className="max-w-full max-h-[250px] object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        {isSelected && (
                          <div className="bg-primary text-white rounded-full p-1">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t">
                        Generated #{index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {selectedLogo && (
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">
                Selected logo: {selectedLogo.id}
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

