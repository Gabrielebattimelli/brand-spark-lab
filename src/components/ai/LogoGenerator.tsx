import React, { useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { 
  generateLogoConcepts as generateIdeogramLogoConcepts, 
  regenerateLogoConcepts as regenerateIdeogramLogoConcepts, 
  GeneratedLogo as IdeogramGeneratedLogo,
  LogoGenerationParams as IdeogramLogoGenerationParams
} from "@/integrations/ai/ideogram";
import {
  generateLogoConcepts as generateClipdropLogoConcepts,
  regenerateLogoConcepts as regenerateClipdropLogoConcepts,
  GeneratedLogo as ClipdropGeneratedLogo,
  LogoGenerationParams as ClipdropLogoGenerationParams
} from "@/integrations/ai/clipdrop";

// Use Ideogram's types as they're identical
type GeneratedLogo = IdeogramGeneratedLogo;
type LogoGenerationParams = IdeogramLogoGenerationParams;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Download } from "lucide-react";

interface LogoGeneratorProps {
  brandName: string;
  industry: string;
  brandPersonality: string;
  onSelect: (logo: GeneratedLogo) => void;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({
  brandName,
  industry,
  brandPersonality,
  onSelect,
}) => {
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

  // State to track which API to use
  const [selectedApi, setSelectedApi] = useState<'ideogram' | 'clipdrop'>(
    ideogramApiKey ? 'ideogram' : clipdropApiKey ? 'clipdrop' : 'ideogram'
  );

  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [aestheticPreferences, setAestheticPreferences] = useState<string[]>([]);
  const [colorPreferences, setColorPreferences] = useState<string[]>(["#f38e63"]);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const handleGenerateLogos = async () => {
    // Check if the required API key is available
    if (selectedApi === 'ideogram' && !ideogramApiKey) {
      setError("Ideogram API key is required to generate logos");
      return;
    } else if (selectedApi === 'clipdrop' && !clipdropApiKey) {
      setError("ClipDrop API key is required to generate logos");
      return;
    }

    if (!brandName) {
      setError("Brand name is required to generate logos");
      return;
    }

    setError(null);
    setIsGeneratingLogos(true);

    try {
      const params: LogoGenerationParams = {
        brandName,
        industry,
        brandPersonality,
        aestheticPreferences: customPrompt 
          ? [...aestheticPreferences, customPrompt] 
          : aestheticPreferences,
        colorPreferences
      };

      let logos;
      if (selectedApi === 'ideogram') {
        logos = await generateIdeogramLogoConcepts(
          ideogramApiKey,
          params,
          6 // Generate 6 logo options
        );
      } else {
        logos = await generateClipdropLogoConcepts(
          clipdropApiKey,
          params,
          6 // Generate 6 logo options
        );
      }

      setGeneratedLogos(logos);

      // If no logo is selected yet, select the first one
      if (!selectedLogo && logos.length > 0) {
        setSelectedLogo(logos[0]);
        onSelect(logos[0]);
      }
    } catch (err) {
      console.error("Error generating logos:", err);
      setError("Failed to generate logos. Please try again.");
    } finally {
      setIsGeneratingLogos(false);
    }
  };

  const handleRegenerateLogos = async () => {
    // Check if the required API key is available
    if (selectedApi === 'ideogram' && !ideogramApiKey) {
      setError("Ideogram API key is required to generate logos");
      return;
    } else if (selectedApi === 'clipdrop' && !clipdropApiKey) {
      setError("ClipDrop API key is required to generate logos");
      return;
    }

    if (!feedback.trim()) {
      setError("Please provide some feedback for regeneration");
      return;
    }

    setError(null);
    setIsGeneratingLogos(true);

    try {
      const params: LogoGenerationParams = {
        brandName,
        industry,
        brandPersonality,
        aestheticPreferences: customPrompt 
          ? [...aestheticPreferences, customPrompt] 
          : aestheticPreferences,
        colorPreferences
      };

      let logos;
      if (selectedApi === 'ideogram') {
        logos = await regenerateIdeogramLogoConcepts(
          ideogramApiKey,
          params,
          feedback,
          6 // Generate 6 logo options
        );
      } else {
        logos = await regenerateClipdropLogoConcepts(
          clipdropApiKey,
          params,
          feedback,
          6 // Generate 6 logo options
        );
      }

      setGeneratedLogos(logos);

      // If no logo is selected yet, select the first one
      if (!selectedLogo && logos.length > 0) {
        setSelectedLogo(logos[0]);
        onSelect(logos[0]);
      }
    } catch (err) {
      console.error("Error regenerating logos:", err);
      setError("Failed to regenerate logos. Please try again.");
    } finally {
      setIsGeneratingLogos(false);
      setFeedback("");
    }
  };

  const handleSelectLogo = (logo: GeneratedLogo) => {
    // Update the selected state of all logos
    const updatedLogos = generatedLogos.map(l => ({
      ...l,
      selected: l.id === logo.id
    }));

    setGeneratedLogos(updatedLogos);
    setSelectedLogo(logo);
    onSelect(logo);
  };

  const handleAddAestheticPreference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customPrompt.trim()) {
      setAestheticPreferences([...aestheticPreferences, customPrompt.trim()]);
      setCustomPrompt("");
      e.preventDefault();
    }
  };

  const handleRemoveAestheticPreference = (preference: string) => {
    setAestheticPreferences(aestheticPreferences.filter(p => p !== preference));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Logo Concepts
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

        {generatedLogos.length === 0 ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Image Generation API</Label>
              <RadioGroup 
                value={selectedApi} 
                onValueChange={(value) => setSelectedApi(value as 'ideogram' | 'clipdrop')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="ideogram" 
                    id="ideogram" 
                    disabled={!ideogramApiKey}
                  />
                  <Label htmlFor="ideogram" className={!ideogramApiKey ? "opacity-50" : ""}>
                    Ideogram
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="clipdrop" 
                    id="clipdrop" 
                    disabled={!clipdropApiKey}
                  />
                  <Label htmlFor="clipdrop" className={!clipdropApiKey ? "opacity-50" : ""}>
                    ClipDrop
                  </Label>
                </div>
              </RadioGroup>
              {!ideogramApiKey && !clipdropApiKey && (
                <p className="text-xs text-red-500">
                  Please provide at least one API key in the API Key Setup step
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="aesthetic-preferences">Aesthetic Preferences</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {aestheticPreferences.map((preference, index) => (
                  <div 
                    key={index} 
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {preference}
                    <button 
                      className="ml-2 text-primary/70 hover:text-primary"
                      onClick={() => handleRemoveAestheticPreference(preference)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="aesthetic-preferences"
                  placeholder="e.g., minimalist, modern, bold (press Enter to add)"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={handleAddAestheticPreference}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">
                Add keywords to guide the logo style (press Enter after each keyword)
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-gray-500 mb-4">
                Click the button below to generate logo concepts based on your brand details
              </p>
              <Button 
                onClick={handleGenerateLogos}
                disabled={isGeneratingLogos}
              >
                {isGeneratingLogos ? (
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedLogos.map((logo) => (
                <div
                  key={logo.id}
                  className={`
                    relative border rounded-lg overflow-hidden cursor-pointer transition-all
                    ${logo.selected ? "ring-2 ring-primary" : "hover:border-primary/50"}
                  `}
                  onClick={() => handleSelectLogo(logo)}
                >
                  <img
                    src={logo.url}
                    alt={`Logo concept for ${brandName}`}
                    className="w-full h-auto"
                  />
                  {logo.selected && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback for Regeneration</Label>
              <Input
                id="feedback"
                placeholder="e.g., make it more minimalist, use brighter colors, make it bolder"
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
                disabled={isGeneratingLogos}
              >
                {isGeneratingLogos ? (
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
                disabled={isGeneratingLogos || !feedback.trim()}
              >
                {isGeneratingLogos ? (
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download size={16} />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
