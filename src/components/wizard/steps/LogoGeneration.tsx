import React, { useState, useEffect } from "react";
import { useAI } from "@/contexts/AIContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateLogoConcepts, regenerateLogoConcepts } from "../../../integrations/ai/logoGeneration";
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
  
  // Initialize with previously saved logo data
  useEffect(() => {
    // First check if we have logos in the AI context
    if (generatedLogos && generatedLogos.length > 0) {
      console.log('Found logos in AI context:', generatedLogos.length);
      console.log('AI context logos:', generatedLogos);
      if (!selectedLogo) {
        console.log('Setting first logo as selected');
        setSelectedLogo(generatedLogos[0]);
      }
      return;
    }

    // If no logos in AI context, check project data
    const savedLogo = data.logo || data.aiGenerated?.logo;
    
    if (savedLogo) {
      console.log('Found saved logo in project data:', savedLogo.url);
      console.log('Project data logo:', savedLogo);
      
      // Convert base64 to blob URL if needed
      const logoWithBlobUrl = {
        ...savedLogo,
        url: savedLogo.url
      };

      // Initialize the generated logos with the saved logo
      setGeneratedLogos([logoWithBlobUrl]);
      setSelectedLogo(logoWithBlobUrl);
    }

    // If no logo in project data, check generated assets
    if (!savedLogo && getAsset) {
      const getLogoAsset = async () => {
        try {
          const asset = await getAsset('logo');
          if (asset && asset.content) {
            const logo = JSON.parse(asset.content) as GeneratedLogo;
            console.log('Found logo in generated assets:', logo.url);
            
            // Initialize the generated logos with the saved logo
            setGeneratedLogos([logo]);
            setSelectedLogo(logo);
          }
        } catch (error) {
          console.error('Error loading logo from generated assets:', error);
        }
      };
      getLogoAsset();
    }

    if (!savedLogo) {
      console.log('No saved logo found in project data');
      console.log('Project data:', data);
    }
  }, [data, generatedLogos, selectedLogo, setGeneratedLogos, setSelectedLogo, getAsset]);

  const handleGenerateLogos = async () => {
    if (!ideogramApiKey && !clipdropApiKey) {
      setError("An API key is required to generate logos");
      return;
    }

    const brandName = data.brandName || data.aiGenerated?.brandName;
    if (!brandName) {
      setError("Brand name is required to generate logos. Please go back to the Brand Name Generator step to select a brand name.");
      return;
    }

    setError(null);
    setIsGeneratingLogos(true);

    try {
      setLoading(true);
      const logos = await generateLogoConcepts(
        ideogramApiKey || clipdropApiKey,
        {
          brandName,
          industry: data.industry || "General",
          brandPersonality: data.brandVoice || "professional and modern",
          aestheticPreferences: data.inspirationKeywords,
          colorPreferences: data.colorPreferences
        },
        4 // Generate 4 logo options
      );

      if (!logos || logos.length === 0) {
        throw new Error("No logos were generated");
      }

      // Update both AI context and project data
      console.log('Saving logo to AI context:', logos[0]);
      setGeneratedLogos(logos);
      setSelectedLogo(logos[0]);
      onChange({ logo: logos[0] });

      // Save to project data
      if (typeof onChange === 'function') {
        console.log('Saving logo to project data:', logos[0]);
        onChange({
          aiGenerated: {
            ...data.aiGenerated,
            logo: logos[0]
          }
        });
      }

      // Save to generated assets
      if (typeof saveAsset === 'function') {
        try {
          const logoData = {
            url: logos[0].url,
            prompt: logos[0].prompt
          };
          await saveAsset('logo', JSON.stringify(logoData), {
            projectId: projectId
          });
          console.log('Successfully saved logo to generated assets');
        } catch (error) {
          console.error('Error saving logo to generated assets:', error);
          toast({
            title: "Warning",
            description: "Failed to save logo to generated assets. It will still be available in this session.",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Logos Generated",
        description: "Successfully generated new logo concepts for your brand.",
      });
    } catch (err) {
      console.error("Error generating logos:", err);
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

  const handleRegenerateLogos = async () => {
    if (!selectedLogo) {
      setError("Please select a logo to regenerate from");
      return;
    }

    if (!feedback) {
      setError("Please provide feedback for regeneration");
      return;
    }

    setError(null);
    setIsGeneratingLogos(true);

    try {
      setLoading(true);
      const logos = await regenerateLogoConcepts(
        ideogramApiKey || clipdropApiKey,
        {
          brandName: data.brandName,
          industry: data.industry || "General",
          brandPersonality: data.brandVoice || "professional and modern",
          aestheticPreferences: data.inspirationKeywords,
          colorPreferences: data.colorPreferences
        },
        feedback
      );

      if (!logos || logos.length === 0) {
        throw new Error("No logos were generated");
      }

      // Update both AI context and project data
      console.log('Saving logo to AI context:', logos[0]);
      setGeneratedLogos(logos);
      setSelectedLogo(logos[0]);
      onChange({ logo: logos[0] });
      setFeedback("");

      // Save to project data
      if (typeof onChange === 'function') {
        console.log('Saving logo to project data:', logos[0]);
        onChange({
          aiGenerated: {
            ...data.aiGenerated,
            logo: logos[0]
          }
        });
      }

      toast({
        title: "Logos Regenerated",
        description: "Successfully generated new logo concepts based on your feedback.",
      });
    } catch (err) {
      console.error("Error regenerating logos:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate logos";
      setError(errorMessage);
      toast({
        title: "Regeneration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLogos(false);
      setLoading(false);
    }
  };

  // Helper function to convert base64 to blob URL
  const convertBase64ToBlob = async (base64Url: string): Promise<string> => {
    const blob = await (await fetch(base64Url)).blob();
    return URL.createObjectURL(blob);
  };

  const handleSelectLogo = (logo: GeneratedLogo) => {
    setSelectedLogo(logo);
    onChange({ 
      logo,
      aiGenerated: {
        ...data.aiGenerated,
        logo
      }
    });

    // Save to generated assets when a logo is selected
    if (typeof saveAsset === 'function' && projectId) {
      try {
        const logoData = {
          url: logo.url,
          prompt: logo.prompt
        };
        saveAsset('logo', JSON.stringify(logoData), {
          projectId: projectId
        });
      } catch (error) {
        console.error('Error saving selected logo to generated assets:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Logo Generation</h1>
        <p className="text-gray-600">
          Generate and customize your brand's logo using AI. You can provide feedback to refine the results.
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Logo Generator
          </CardTitle>
          <CardDescription>
            Generate logo concepts for your brand using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!generatedLogos || generatedLogos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-gray-500 mb-4">
                Click the button below to generate logo concepts based on your brand details
              </p>
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
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedLogos.map((logo, index) => (
                  <div
                    key={logo.url || `logo-${index}`}
                    className={`
                      relative border rounded-lg overflow-hidden cursor-pointer transition-all
                      ${selectedLogo?.url === logo.url ? "ring-2 ring-primary" : "hover:border-primary/50"}
                    `}
                    onClick={() => handleSelectLogo(logo)}
                  >
                    <img
                      src={logo.url}
                      alt={`Logo concept ${index + 1}`}
                      className="w-full h-auto"
                      onError={(e) => {
                        // Try to convert base64 to blob URL if needed
                        if (logo.url.startsWith('data:')) {
                          try {
                            const blob = new Blob([atob(logo.url.split(',')[1])], { type: 'image/png' });
                            const url = URL.createObjectURL(blob);
                            e.currentTarget.src = url;
                          } catch (error) {
                            console.error('Failed to convert base64 to blob:', error);
                            e.currentTarget.src = '/placeholder-logo.svg';
                          }
                        } else {
                          e.currentTarget.src = '/placeholder-logo.svg';
                        }
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      {selectedLogo?.url === logo.url && (
                        <div className="bg-primary text-white rounded-full p-1">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback for Regeneration</Label>
                <Input
                  id="feedback"
                  placeholder="e.g., make it more modern, simpler, more colorful"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Provide feedback to guide the regeneration of logo concepts
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
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
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate New Set
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRegenerateLogos}
                  disabled={isGeneratingLogos || loading || !feedback.trim()}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Apply Feedback
                    </>
                  )}
                </Button>
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