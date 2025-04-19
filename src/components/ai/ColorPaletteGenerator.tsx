import React, { useState, useEffect } from "react";
import { useAI } from "@/contexts/AIContext";
import { useParams } from "react-router-dom";
import { useColorPaletteStorage } from "@/hooks/use-color-palette-storage";
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
import { toast } from "@/components/ui/use-toast";

export interface ColorPaletteGeneratorProps {
  brandName: string;
  industry: string;
  brandPersonality: string;
  onSelect: (palette: GeneratedColorPalette) => void;
  onPreferencesChange?: (aestheticPreferences: string[], colorPreferences: string[]) => void;
}

export const ColorPaletteGenerator: React.FC<ColorPaletteGeneratorProps> = ({
  brandName,
  industry,
  brandPersonality,
  onSelect,
  onPreferencesChange,
}) => {
  const { projectId } = useParams<{ projectId?: string }>(); // Get the current project ID from the URL
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [initialGenerationDone, setInitialGenerationDone] = useState(false);
  
  // Use our color palette storage hook
  const { loadColorPalettes, saveColorPalettes, saveSelectedPalette, savePreferences, loadPreferences } = useColorPaletteStorage(projectId);

  // Initial load of color palettes and preferences from the database
  useEffect(() => {
    if (!initialLoadComplete && projectId) {
      console.log('Loading color palettes and preferences from Supabase for project:', projectId);
      
      const fetchData = async () => {
        try {
          // Load color palettes
          const { colorPalettes, selectedPalette } = await loadColorPalettes();
          
          if (colorPalettes.length > 0) {
            console.log('Found stored color palettes:', colorPalettes);
            setGeneratedColorPalettes(colorPalettes);
            setInitialGenerationDone(true);
            
            if (selectedPalette) {
              console.log('Found selected color palette:', selectedPalette);
              setSelectedColorPalette(selectedPalette);
              onSelect(selectedPalette);
            }
          }
          
          // Load preferences
          const preferences = await loadPreferences();
          if (preferences) {
            console.log('Found stored preferences:', preferences);
            const loadedAestheticPrefs = preferences.aestheticPreferences || [];
            const loadedColorPrefs = preferences.colorPreferences || [];
            
            // Update local state
            setAestheticPreferences(loadedAestheticPrefs);
            setColorPreferences(loadedColorPrefs);
            if (preferences.customPreference) {
              setCustomPreference(preferences.customPreference);
            }
            
            // Notify parent component about loaded preferences
            if (onPreferencesChange && 
              (loadedAestheticPrefs.length > 0 || loadedColorPrefs.length > 0)) {
              console.log('Notifying parent about loaded preferences:', loadedAestheticPrefs, loadedColorPrefs);
              onPreferencesChange(loadedAestheticPrefs, loadedColorPrefs);
            }
            else{
              console.log('No preferences loaded or empty preferences. Not notifying parent.');}
          }
        } catch (err) {
          console.error('Error loading data from database:', err);
        } finally {
          setInitialLoadComplete(true);
        }
      };
      
      fetchData();
    }
  }, [projectId, initialLoadComplete, loadColorPalettes, loadPreferences, setGeneratedColorPalettes, setSelectedColorPalette, onSelect]);

  // Only automatically generate palettes if none were loaded from storage and we haven't generated any yet
  useEffect(() => {
    if (initialLoadComplete && !initialGenerationDone && generatedColorPalettes.length === 0 && 
        brandName && industry && !isGeneratingPalettes) {
      console.log('No stored palettes found, generating initial palettes');
      handleGeneratePalettes();
    }
  }, [initialLoadComplete, initialGenerationDone, generatedColorPalettes, brandName, industry, isGeneratingPalettes]);
  
  const handleGeneratePalettes = async () => {
    // Check if the required API key is available
    if (!geminiApiKey || geminiApiKey.trim() === "") {
      setError("Gemini API key is required to generate color palettes. Please set your API key in the settings.");
      toast({
        title: "API Key Missing",
        description: "Please set your Gemini API key in the settings to generate color palettes.",
        variant: "destructive",
      });
      return;
    }

    if (!brandName?.trim()) {
      setError("Brand name is required to generate color palettes");
      toast({
        title: "Missing Information",
        description: "Please provide a brand name to generate color palettes.",
        variant: "destructive",
      });
      return;
    }

    if (!industry?.trim()) {
      setError("Industry is required to generate color palettes");
      toast({
        title: "Missing Information",
        description: "Please provide an industry to generate color palettes.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setIsGeneratingPalettes(true);

    try {
      const params: ColorPaletteGenerationParams = {
        brandName: brandName.trim(),
        industry: industry.trim(),
        brandPersonality: brandPersonality?.trim() || "professional and modern",
        aestheticPreferences: customPreference 
          ? [...aestheticPreferences, customPreference.trim()] 
          : aestheticPreferences,
        colorPreferences: colorPreferences.length > 0 ? colorPreferences : undefined
      };

      const palettes = await generateColorPalettes(
        geminiApiKey,
        params,
        3 // Generate 3 palette options
      );

      if (!palettes || palettes.length === 0) {
        throw new Error("No color palettes were generated");
      }

      setGeneratedColorPalettes(palettes);
      

      // Save to Supabase
      if (projectId) {
        console.log('Saving color palettes and preferences to Supabase');
        const preferences = {
          aestheticPreferences,
          colorPreferences,
          customPreference
        };
        await saveColorPalettes(palettes, palettes[0], preferences);
      }

      // If no palette is selected yet, select the first one
      if (!selectedColorPalette && palettes.length > 0) {
        setSelectedColorPalette(palettes[0]);
        onSelect(palettes[0]);
      }
      
      // Set the flag after successfull generation
      setInitialGenerationDone(true);

      // Show success message
      toast({
        title: "Color Palettes Generated",
        description: "Successfully generated new color palettes for your brand.",
      });
    } catch (err) {
      console.error("Error generating color palettes:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate color palettes";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPalettes(false);
    }
  };

  const handleRegeneratePalettes = async () => {
    if (!selectedColorPalette) {
      setError("Please select a palette to regenerate from");
      toast({
        title: "No Palette Selected",
        description: "Please select a palette before regenerating.",
        variant: "destructive",
      });
      return;
    }

    // Remove the feedback validation since it should be optional
    setError(null);
    setIsGeneratingPalettes(true);

    try {
      const params: ColorPaletteGenerationParams = {
        brandName: brandName.trim(),
        industry: industry.trim(),
        brandPersonality: brandPersonality?.trim() || "professional and modern",
        aestheticPreferences: customPreference 
          ? [...aestheticPreferences, customPreference.trim()] 
          : aestheticPreferences,
        colorPreferences: colorPreferences.length > 0 ? colorPreferences : undefined
      };

      const palettes = await regenerateColorPalettes(
        geminiApiKey,
        params,
        feedback.trim() || "Generate a new set of color palettes with similar style but different colors", // Provide default feedback if none given
        3
      );

      if (!palettes || palettes.length === 0) {
        throw new Error("No color palettes were generated");
      }

      setGeneratedColorPalettes(palettes);
      setSelectedColorPalette(palettes[0]);
      onSelect(palettes[0]);
      setFeedback(""); // Clear feedback after successful regeneration
      
      // Save to Supabase
      if (projectId) {
        console.log('Saving regenerated color palettes and preferences to Supabase');
        const preferences = {
          aestheticPreferences,
          colorPreferences,
          customPreference
        };
        await saveColorPalettes(palettes, palettes[0], preferences);
      }

      toast({
        title: "Palettes Regenerated",
        description: "Successfully generated new color palettes.",
      });
    } catch (err) {
      console.error("Error regenerating color palettes:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate color palettes";
      setError(errorMessage);
      toast({
        title: "Regeneration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPalettes(false);
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
    
    // Save the selected palette to Supabase
    if (projectId) {
      console.log('Saving selected color palette to Supabase:', palette);
      saveSelectedPalette(palette);
      saveColorPalettes(updatedPalettes, palette);
    }
  };

  const handleAddPreference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customPreference.trim()) {
      const updatedPreferences = [...aestheticPreferences, customPreference.trim()];
      setAestheticPreferences(updatedPreferences);
      setCustomPreference("");
      
      // Save updated preferences
      if (projectId) {
        console.log('Saving updated aesthetic preferences');
        savePreferences({
          aestheticPreferences: updatedPreferences,
          colorPreferences,
          customPreference: ""
        });
      }
      
      // Update parent component's form data
      if (onPreferencesChange) {
        onPreferencesChange(updatedPreferences, colorPreferences);
      }
      
      e.preventDefault();
    }
  };

  const handleAddColorPreference = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customPreference.trim()) {
      // Check if the input is a valid color (hex, rgb, or color name)
      const updatedColorPreferences = [...colorPreferences, customPreference.trim()];
      setColorPreferences(updatedColorPreferences);
      setCustomPreference("");
      
      // Save updated preferences
      if (projectId) {
        console.log('Saving updated color preferences after adding new color');
        savePreferences({
          aestheticPreferences,
          colorPreferences: updatedColorPreferences,
          customPreference: ""
        });
      }
      
      // Update parent component's form data
      if (onPreferencesChange) {
        onPreferencesChange(aestheticPreferences, updatedColorPreferences);
      }
      
      e.preventDefault();
    }
  };

  const handleRemovePreference = (preference: string) => {
    const updatedPreferences = aestheticPreferences.filter(p => p !== preference);
    setAestheticPreferences(updatedPreferences);
    
    // Save updated preferences
    if (projectId) {
      console.log('Saving updated aesthetic preferences after delete');
      savePreferences({
        aestheticPreferences: updatedPreferences,
        colorPreferences,
        customPreference
      });
    }
    
    // Update parent component's form data
    if (onPreferencesChange) {
      onPreferencesChange(updatedPreferences, colorPreferences);
    }
  };

  const handleRemoveColorPreference = (color: string) => {
    const updatedColorPreferences = colorPreferences.filter(c => c !== color);
    setColorPreferences(updatedColorPreferences);
    
    // Save updated preferences
    if (projectId) {
      console.log('Saving updated color preferences');
      savePreferences({
        aestheticPreferences,
        colorPreferences: updatedColorPreferences,
        customPreference
      });
    }
    
    // Update parent component's form data
    if (onPreferencesChange) {
      onPreferencesChange(aestheticPreferences, updatedColorPreferences);
    }
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

        
        <div className="space-y-6">
            
        {/* Preferences Section */}
        {generatedColorPalettes.length === 0 || !initialGenerationDone ? (
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
            </div>) : null}
            
            {/* Generate Button */}
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
                  Generate
                </>
              )}
            </Button>
            </div>
            {/* Palettes Section */}
            {generatedColorPalettes.length > 0 && initialGenerationDone ? (
            <div className="grid grid-cols-1 gap-6">
            {generatedColorPalettes.map((palette) => ( <div key={palette.id} className={` relative border rounded-lg overflow-hidden cursor-pointer transition-all p-4 ${palette.selected ? "ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => handleSelectPalette(palette)} > <div className="flex items-center justify-between mb-2"> <h3 className="font-medium">Palette {palette.id.split('-')[1]}</h3> {palette.selected && ( <div className="bg-primary text-white rounded-full p-1"> <CheckCircle size={16} /> </div> )} </div>
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
                    ))} </div> </div>))} </div>
            ) : null}
            {/* Feedback Section */}
            {selectedColorPalette && (
            <div className="space-y-2">
            <Label htmlFor="feedback">Feedback for Regeneration</Label>
            <Input id="feedback" placeholder="e.g., make it brighter, more professional, more muted" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            <p className="text-xs text-gray-500"> Provide feedback to guide the regeneration of color palettes </p>
            </div>
            )}
            
            {/* Apply Feedback Button */}
            {selectedColorPalette &&(
            <div className="flex justify-center gap-4">
            <Button
              
                variant="outline"
                onClick={handleGeneratePalettes}
                disabled={isGeneratingPalettes}
              > {isGeneratingPalettes ? ( <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating... </> ) : ( <><RefreshCw className="mr-2 h-4 w-4" /> Generate </> )} </Button>
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
              </Button></div>
            )}
          </div>
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