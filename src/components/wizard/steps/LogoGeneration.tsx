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
import { LogoGallery } from "./LogoGallery";

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
  getAllLogos?: () => Promise<GeneratedLogo[]>;
  projectId?: string;
}

export const LogoGeneration = ({ data, onChange, getAsset, saveAsset, getAllLogos, projectId }: LogoGenerationProps) => {
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
        // Skip if already initialized
        if (initialized) {
          return;
        }
        
        // Log warning if no project ID
        if (!projectId) {
          console.log(`LogoGeneration: no project ID available, but will continue with initialization`);
        }
        
        // Log the current state of generatedLogos for debugging
        console.log(`LogoGeneration: initializing with ${generatedLogos.length} logos already in state`);
        
        // If we already have logos in the state, just mark as initialized and return
        if (generatedLogos && generatedLogos.length > 0) {
          console.log(`LogoGeneration: using ${generatedLogos.length} logos from state`);
          setInitialized(true);
          return;
        }
        
        // Use the new getAllLogos function if available
        if (getAllLogos) {
          try {
            const allLogos = await getAllLogos();
            
            if (allLogos && Array.isArray(allLogos)) {
              console.log(`LogoGeneration: loaded ${allLogos.length} logos from getAllLogos`);
              
              // Force a refresh of the logos
              setGeneratedLogos([]);
              
              // Then set the logos
              setTimeout(() => {
                setGeneratedLogos(allLogos);
              }, 0);
              
              // Find the selected logo (use the one from project data if available)
              const selectedLogoFromData = data.logo || (data.aiGenerated && data.aiGenerated.logo);
              
              if (selectedLogoFromData) {
                // Find the matching logo in allLogos
                const matchingLogo = allLogos.find(logo => logo && logo.id === selectedLogoFromData.id);
                
                if (matchingLogo) {
                  console.log(`LogoGeneration: setting selected logo from allLogos: ${matchingLogo.id}`);
                  setSelectedLogo(matchingLogo);
                } else {
                  console.log(`LogoGeneration: setting selected logo from project data: ${selectedLogoFromData.id}`);
                  setSelectedLogo(selectedLogoFromData);
                }
              } else if (allLogos.length > 0 && allLogos[0]) {
                // If no selected logo in project data, use the first logo
                console.log(`LogoGeneration: setting first logo as selected: ${allLogos[0].id}`);
                setSelectedLogo(allLogos[0]);
              }
              
              // Log success
              toast({
                title: "Logos Restored",
                description: `Successfully restored ${allLogos.length} logo concepts.`,
                variant: "default",
              });
              
              setInitialized(true);
              return;
            }
          } catch (error) {
            console.error("Error loading logos with getAllLogos:", error);
          }
        }
        
        // Fallback to legacy methods if getAllLogos fails or is not available
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
                
                if (allLogosContent && allLogosContent.logos && Array.isArray(allLogosContent.logos)) {
                  // Ensure each logo has a unique ID
                  const uniqueLogos = allLogosContent.logos.map((logo, index) => ({
                    ...logo,
                    id: logo.id || `logo-restored-${index}`
                  }));
                  
                  // Find the selected logo
                  const selectedLogoId = allLogosContent.selectedLogoId;
                  selectedLogoFromAssets = uniqueLogos.find(logo => logo.id === selectedLogoId);
                  
                  // Store the loaded logos
                  loadedLogos = uniqueLogos;
                  logosLoaded = true;
                  
                  // Set the logos in state
                  console.log(`LogoGeneration: loaded ${uniqueLogos.length} logos from 'logos' asset`);
                  // Force a refresh of the logos
                  setGeneratedLogos([]);
                  // Then set the logos
                  setTimeout(() => {
                    setGeneratedLogos(uniqueLogos);
                  }, 0);
                  
                  // Set the selected logo if one was found
                  if (selectedLogoFromAssets) {
                    console.log(`LogoGeneration: setting selected logo from 'logos' asset: ${selectedLogoFromAssets.id}`);
                    setSelectedLogo(selectedLogoFromAssets);
                  }
                }
              } catch (parseError) {
                console.error("Error parsing logos asset:", parseError);
              }
            }
            
            // If no logos were loaded from the main storage, try fallback methods
            if (!logosLoaded) {
              // Try legacy single logo storage
              const asset = await getAsset('logo');
              if (asset && asset.content) {
                try {
                  const logoContent = JSON.parse(asset.content);
                  if (logoContent && logoContent.url) {
                    loadedLogos = [logoContent];
                    selectedLogoFromAssets = logoContent;
                    logosLoaded = true;
                    setGeneratedLogos(loadedLogos);
                    setSelectedLogo(selectedLogoFromAssets);
                  }
                } catch (parseError) {
                  console.error("Error parsing legacy logo asset:", parseError);
                }
              }
              
              // Try project data as last resort
              if (!logosLoaded && data.logo) {
                loadedLogos = [data.logo];
                selectedLogoFromAssets = data.logo;
                setGeneratedLogos(loadedLogos);
                setSelectedLogo(selectedLogoFromAssets);
                logosLoaded = true;
              }
            }
          } catch (assetError) {
            console.error("Error loading logos from assets:", assetError);
            toast({
              title: "Warning",
              description: "Could not load all previously generated logos.",
              variant: "destructive",
            });
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Logo initialization error:", error);
        setInitialized(true);
        toast({
          title: "Error",
          description: "Failed to initialize logos.",
          variant: "destructive",
        });
      }
    };

    initializeLogos();
  }, [data, getAsset, getAllLogos, projectId, initialized, generatedLogos, setGeneratedLogos, setSelectedLogo, onChange]);

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
      console.log(`LogoGeneration: setting ${uniqueLogos.length} logos (${updatedNewLogos.length} new, ${generatedLogos.length} existing)`);
      // Force a refresh of the logos
      setGeneratedLogos([]);
      // Then set the logos
      setTimeout(() => {
        setGeneratedLogos(uniqueLogos);
      }, 0);
      
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
    console.log(`LogoGeneration: selecting logo ${logo.id}`);
    
    // Update the selected state for all logos
    const updatedLogos = generatedLogos.map(l => ({
      ...l,
      selected: l.id === logo.id
    }));
    
    // Update state
    setGeneratedLogos(updatedLogos);
    setSelectedLogo({...logo, selected: true});
    
    // Update project data with the selected logo
    // Make sure to include both the direct logo property and the aiGenerated.logo property
    // This ensures that canProceed will work correctly
    const updatedData = { 
      logo: {...logo, selected: true},
      aiGenerated: {
        ...data.aiGenerated,
        logo: {...logo, selected: true}
      }
    };
    
    console.log(`LogoGeneration: updating project data with selected logo ${logo.id}`);
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

  // Log the current state for debugging
  console.log(`LogoGeneration render: ${generatedLogos.length} logos in state, selected logo: ${selectedLogo?.id || 'none'}`);
  
  // Force a re-render if we have logos in the AIContext but not in the component state
  useEffect(() => {
    if (!initialized && generatedLogos.length > 0) {
      console.log(`LogoGeneration: found ${generatedLogos.length} logos in AIContext, marking as initialized`);
      setInitialized(true);
      
      // Also save the logos to the database if we have them in the AIContext
      if (typeof saveAsset === 'function' && projectId) {
        try {
          // Save all logos with metadata
          const allLogosData = {
            logos: generatedLogos,
            selectedLogoId: selectedLogo ? selectedLogo.id : (generatedLogos.length > 0 ? generatedLogos[0].id : null),
            timestamp: Date.now() // Add timestamp for versioning
          };
          
          // Save with project ID in metadata for security
          saveAsset('logos', JSON.stringify(allLogosData), {
            projectId: projectId,
            count: generatedLogos.length
          }).then(() => {
            console.log(`LogoGeneration: saved ${generatedLogos.length} logos to database`);
          }).catch(error => {
            console.error("Error saving logos:", error);
          });
        } catch (error) {
          console.error("Error preparing logos for save:", error);
        }
      }
    }
  }, [generatedLogos, initialized, saveAsset, projectId, selectedLogo]);
  
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
          
          <LogoGallery 
            logos={generatedLogos} 
            selectedLogo={selectedLogo} 
            onSelectLogo={handleSelectLogo} 
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2">
          {selectedLogo && (
            <div className="w-full">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Logo:
              </p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 border rounded overflow-hidden">
                  <img 
                    src={selectedLogo.url} 
                    alt="Selected logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  ID: {selectedLogo.id}
                </p>
              </div>
            </div>
          )}
          <div className="w-full mt-2">
            <p className="text-xs text-gray-500">
              Total logos generated: {generatedLogos.length}
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

