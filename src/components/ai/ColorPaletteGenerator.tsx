import React, { useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { 
  generateColorPalettes,
  regenerateColorPalettes,
  GeneratedColorPalette,
  ColorPaletteGenerationParams
} from "@/integrations/ai/colorPalette";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Download } from "lucide-react";

interface ColorPaletteGeneratorProps {
  brandName: string;
  industry: string;
  brandPersonality: string;
  onSelect: (palette: GeneratedColorPalette) => void;
}

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({
  brandName,
  industry,
  brandPersonality,
  onSelect,
}) => {
  const { 
    geminiApiKey,
    generatedColorPalettes, 
    setGeneratedColorPalettes,
    selectedColorPalette,
    setSelectedColorPalette,
    isGeneratingPalettes,
    setIsGeneratingPalettes
  } = useAI();

  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [aestheticPreferences, setAestheticPreferences] = useState<string[]>([]);
  const [colorPreferences, setColorPreferences] = useState<string[]>([]);
  const [customPreference, setCustomPreference] = useState<string>("");

  const handleGeneratePalettes = async () => {
    // Check if the required API key is available
    if (!geminiApiKey) {
      setError("Gemini API key is required to generate color palettes");
      return;
    }

    if (!brandName) {
      setError("Brand name is required to generate color palettes");
      return;
    }

    setError(null);
    setIsGeneratingPalettes(true);

    try {
      const params: ColorPaletteGenerationParams = {
        brandName,
        industry,
        brandPersonality,
        aestheticPreferences: customPreference 
          ? [...aestheticPreferences, customPreference] 
          : aestheticPreferences,
        colorPreferences
      };

      const palettes = await generateColorPalettes(
        geminiApiKey,
        params,
        3 // Generate 3 palette options
      );

      setGeneratedColorPalettes(palettes);

      // If no palette is selected yet, select the first one
      if (!selectedColorPalette && palettes.length > 0) {
        setSelectedColorPalette(palettes[0]);
        onSelect(palettes[0]);
      }
    } catch (err) {
      console.error("Error generating color palettes:", err);
      setError("Failed to generate color palettes. Please try again.");
    } finally {
      setIsGeneratingPalettes(false);
    }
  };

  const handleRegeneratePalettes = async () => {
    // Check if the required API key is available
    if (!geminiApiKey) {
      setError("Gemini API key is required to generate color palettes");
      return;
    }

    if (!feedback.trim()) {
      setError("Please provide some feedback for regeneration");
      return;
    }

    setError(null);
    setIsGeneratingPalettes(true);

    try {
      const params: ColorPaletteGenerationParams = {
        brandName,
        industry,
        brandPersonality,
        aestheticPreferences: customPreference 
          ? [...aestheticPreferences, customPreference] 
          : aestheticPreferences,
        colorPreferences
      };

      const palettes = await regenerateColorPalettes(
        geminiApiKey,
        params,
        feedback,
        3 // Generate 3 palette options
      );

      setGeneratedColorPalettes(palettes);

      // If no palette is selected yet, select the first one
      if (!selectedColorPalette && palettes.length > 0) {
        setSelectedColorPalette(palettes[0]);
        onSelect(palettes[0]);
      }
    } catch (err) {
      console.error("Error regenerating color palettes:", err);
      setError("Failed to regenerate color palettes. Please try again.");
    } finally {
      setIsGeneratingPalettes(false);
      setFeedback("");
    }
  };

  const handleSelectPalette = (palette: GeneratedColorPalette) => {
    // Update the selected state of all palettes
    const updatedPalettes = generatedColorPalettes.map(p => ({
      ...p,
      selected: p.id === palette.id
    }));

    setGeneratedColorPalettes(updatedPalettes);
    setSelectedColorPalette(palette);
    onSelect(palette);
  };

  const handleAddPreference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customPreference.trim()) {
      setAestheticPreferences([...aestheticPreferences, customPreference.trim()]);
      setCustomPreference("");
      e.preventDefault();
    }
  };

  const handleAddColorPreference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customPreference.trim()) {
      // Check if the input is a valid color (hex, rgb, or color name)
      setColorPreferences([...colorPreferences, customPreference.trim()]);
      setCustomPreference("");
      e.preventDefault();
    }
  };

  const handleRemovePreference = (preference: string) => {
    setAestheticPreferences(aestheticPreferences.filter(p => p !== preference));
  };

  const handleRemoveColorPreference = (color: string) => {
    setColorPreferences(colorPreferences.filter(c => c !== color));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Color Palette Generator
        </CardTitle>
        <CardDescription>
          Generate color palettes for your brand using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedColorPalettes.length === 0 ? (
          <div className="space-y-6">
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
                      onClick={() => handleRemovePreference(preference)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="aesthetic-preferences"
                  placeholder="e.g., modern, elegant, playful (press Enter to add)"
                  value={customPreference}
                  onChange={(e) => setCustomPreference(e.target.value)}
                  onKeyDown={handleAddPreference}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">
                Add keywords to guide the color palette style (press Enter after each keyword)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-preferences">Color Preferences</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colorPreferences.map((color, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 rounded-full text-sm flex items-center"
                    style={{ 
                      backgroundColor: color.startsWith('#') ? color : undefined,
                      color: color.startsWith('#') ? (isLightColor(color) ? '#000' : '#fff') : undefined,
                      border: !color.startsWith('#') ? '1px solid #e2e8f0' : undefined
                    }}
                  >
                    {color}
                    <button 
                      className="ml-2 hover:opacity-70"
                      onClick={() => handleRemoveColorPreference(color)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="color-preferences"
                  placeholder="e.g., blue, #FF5733, vibrant (press Enter to add)"
                  value={customPreference}
                  onChange={(e) => setCustomPreference(e.target.value)}
                  onKeyDown={handleAddColorPreference}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">
                Add specific colors or color descriptions (press Enter after each)
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-gray-500 mb-4">
                Click the button below to generate color palettes based on your brand details
              </p>
              <Button 
                onClick={handleGeneratePalettes}
                disabled={isGeneratingPalettes}
              >
                {isGeneratingPalettes ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Color Palettes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {generatedColorPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className={`
                    relative border rounded-lg overflow-hidden cursor-pointer transition-all p-4
                    ${palette.selected ? "ring-2 ring-primary" : "hover:border-primary/50"}
                  `}
                  onClick={() => handleSelectPalette(palette)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Palette {palette.id.split('-')[1]}</h3>
                    {palette.selected && (
                      <div className="bg-primary text-white rounded-full p-1">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {palette.colors.map((color, index) => (
                      <div key={index} className="text-center">
                        <div
                          className="h-16 rounded-md mb-1"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="text-xs font-medium">{color.name}</p>
                        <p className="text-xs text-gray-600">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback for Regeneration</Label>
              <Input
                id="feedback"
                placeholder="e.g., make it brighter, more professional, more muted"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Provide feedback to guide the regeneration of color palettes
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleGeneratePalettes}
                disabled={isGeneratingPalettes}
              >
                {isGeneratingPalettes ? (
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
                onClick={handleRegeneratePalettes}
                disabled={isGeneratingPalettes || !feedback.trim()}
              >
                {isGeneratingPalettes ? (
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
        {selectedColorPalette && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              Selected palette: {selectedColorPalette.id}
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

// Helper function to determine if a color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove the # if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if the color is light
  return brightness > 128;
};