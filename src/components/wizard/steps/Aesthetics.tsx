import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ColorPaletteGenerator } from "@/components/ai/ColorPaletteGenerator";
import { useParams } from "react-router-dom";
import { X, Plus, Upload, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAI } from "@/contexts/AIContext";
import { generateColorPalettes, generateDefaultPalettes, ColorPaletteGenerationParams, GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { toast } from "@/components/ui/use-toast";

import { FormData } from '@/pages/projects/BrandWizard';

interface AestheticsProps {
  data: FormData;
  onChange: (data: Partial<FormData>, forceSave?: boolean) => void;
}

const visualStyles = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, simple, and uncluttered design with ample white space.",
    imageUrl: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#FFFFFF", "#F5F5F5", "#333333", "#000000", "#E0E0E0"]
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong colors, distinctive typography, and eye-catching elements.",
    imageUrl: "https://images.unsplash.com/photo-1568377210220-151e1d7f42c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#FF3366", "#3A0CA3", "#FFCA3A", "#000000", "#FFFFFF"]
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined, sophisticated aesthetic with premium feel.",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#D4AF37", "#000000", "#FFFFFF", "#F5F5F5", "#333333"]
  },
  {
    id: "retro",
    name: "Retro",
    description: "Vintage-inspired design elements that evoke nostalgia.",
    imageUrl: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89", "#1A659E"]
  },
  {
    id: "techy",
    name: "Tech-Forward",
    description: "Modern, cutting-edge look with digital elements and futuristic aesthetics.",
    imageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#00B2CA", "#7DCFB6", "#1D3557", "#000000", "#FFFFFF"]
  },
  {
    id: "playful",
    name: "Playful",
    description: "Fun, vibrant design with whimsical elements and creative touches.",
    imageUrl: "https://images.unsplash.com/photo-1560800452-f2d475982b96?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#FF9F1C", "#FFBF69", "#CBF3F0", "#2EC4B6", "#FFFFFF"]
  },
  {
    id: "organic",
    name: "Organic/Natural",
    description: "Nature-inspired design with earthy tones and organic shapes.",
    imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#606C38", "#283618", "#FEFAE0", "#DDA15E", "#BC6C25"]
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional, polished look suitable for traditional business environments.",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    colors: ["#003049", "#D62828", "#F77F00", "#FCBF49", "#EAE2B7"]
  }
];

const colorOptions = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", 
  "Brown", "Gray", "Black", "White", "Gold", "Silver", "Teal", 
  "Navy", "Burgundy", "Mint", "Coral", "Lavender"
];

export const Aesthetics = ({ data, onChange }: AestheticsProps) => {
  const { geminiApiKey } = useAI();
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) {
    console.error('Project ID is required in Aesthetics component');
    return null;
  }
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FormData>>({
    visualStyle: data.visualStyle || "",
    colorPreferences: data.colorPreferences || [],
    inspirationKeywords: data.inspirationKeywords || [],
    moodboardUrls: data.moodboardUrls || [],
    aiGenerated: {
      ...data.aiGenerated,
      colorPalette: data.aiGenerated?.colorPalette || null
    }
  });
  
  // Track whether preferences have been loaded from assets storage
  const [prefLoadedFromAssets, setPrefLoadedFromAssets] = useState(false);

  const [newKeyword, setNewKeyword] = useState("");
  const [newMoodboardUrl, setNewMoodboardUrl] = useState("");
  const [newColor, setNewColor] = useState("");
  const [colorPalettes, setColorPalettes] = useState<GeneratedColorPalette[]>([]);
  const [isGeneratingPalettes, setIsGeneratingPalettes] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Get the selected visual style
  const selectedStyle = visualStyles.find(style => style.id === formData.visualStyle);

  // Function to regenerate color palettes
  const regeneratePalettes = async () => {
    if (!formData.visualStyle) {
      setError("Please select a visual style first");
      toast({
        title: "Missing Visual Style",
        description: "Please select a visual style before generating color palettes.",
        variant: "destructive",
      });
      return;
    }

    // Check if we should debounce
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    const debounceDelay = 5000; // 5 seconds

    if (timeSinceLastGeneration < debounceDelay) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      setDebounceTimeout(
        setTimeout(() => {
          regeneratePalettes();
        }, debounceDelay - timeSinceLastGeneration)
      );
      return;
    }

    try {
      setIsGeneratingPalettes(true);
      setError(null);
      setLastGenerationTime(now);

      const params: ColorPaletteGenerationParams = {
        brandName: data.businessName?.trim() || "Brand",
        industry: data.industry?.trim() || "General",
        brandPersonality: formData.visualStyle,
        aestheticPreferences: [formData.visualStyle, ...(formData.inspirationKeywords || [])],
        colorPreferences: formData.colorPreferences || []
      };

      let palettes: GeneratedColorPalette[];
      try {
        if (geminiApiKey && geminiApiKey.trim()) {
          palettes = await generateColorPalettes(
            geminiApiKey,
            params,
            3,
            3, // max retries
            2000 // initial delay
          );
        } else {
          console.warn("No Gemini API key found, using default palettes");
          palettes = generateDefaultPalettes(3, params);
        }
      } catch (apiError) {
        console.error("Error generating palettes with API:", apiError);
        toast({
          title: "API Generation Failed",
          description: "Using default color palettes instead.",
          variant: "default",
        });
        palettes = generateDefaultPalettes(3, params);
      }

      if (!palettes || palettes.length === 0) {
        throw new Error("Failed to generate color palettes");
      }

      setColorPalettes(palettes);

      // Update formData with the generated palettes
      const updatedData = {
        ...formData,
        colorPalettes: palettes,
        aiGenerated: {
          ...formData.aiGenerated,
          colorPalette: palettes[0] || null
        }
      };
      setFormData(updatedData);
      onChange(updatedData);

      toast({
        title: "Color Palettes Generated",
        description: "Successfully generated new color palettes for your brand.",
      });
    } catch (error) {
      console.error("Error in palette generation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate color palettes";
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

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Only generate palettes when the button is clicked
  const handleGeneratePalettes = () => {
    regeneratePalettes();
  };

  const handleVisualStyleChange = (value: string) => {
    const updatedData = {
      ...formData,
      visualStyle: value,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const toggleColorPreference = (color: string) => {
    const updatedColors = formData.colorPreferences.includes(color)
      ? formData.colorPreferences.filter((c: string) => c !== color)
      : [...formData.colorPreferences, color];

    const updatedData = {
      ...formData,
      colorPreferences: updatedColors,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const addCustomColor = () => {
    if (!newColor.trim()) return;

    const updatedData = {
      ...formData,
      colorPreferences: [...formData.colorPreferences, newColor],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewColor("");
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    const updatedData = {
      ...formData,
      inspirationKeywords: [...formData.inspirationKeywords, newKeyword],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewKeyword("");
  };

  const removeKeyword = (index: number) => {
    const updatedKeywords = [...formData.inspirationKeywords];
    updatedKeywords.splice(index, 1);

    const updatedData = {
      ...formData,
      inspirationKeywords: updatedKeywords,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const addMoodboardUrl = () => {
    if (!newMoodboardUrl.trim()) return;

    const updatedData = {
      ...formData,
      moodboardUrls: [...formData.moodboardUrls, newMoodboardUrl],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewMoodboardUrl("");
  };

  const removeMoodboardUrl = (index: number) => {
    const updatedUrls = [...formData.moodboardUrls];
    updatedUrls.splice(index, 1);

    const updatedData = {
      ...formData,
      moodboardUrls: updatedUrls,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Visual Style & Aesthetics</h1>
        <p className="text-gray-600">
          Define how your brand looks and feels visually. This will guide the design of your logo and visual identity elements.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Visual Style</h2>
          <p className="text-gray-600 mb-6">
            Select the visual aesthetic that best represents your brand.
          </p>

          <RadioGroup
            value={formData.visualStyle}
            onValueChange={handleVisualStyleChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {visualStyles.map((style) => (
              <div key={style.id} className="relative">
                <RadioGroupItem
                  value={style.id}
                  id={style.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={style.id}
                  className="flex flex-col p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-gray-50 transition-colors"
                >
                  <div className="mb-3 overflow-hidden rounded-md">
                    <img 
                      src={style.imageUrl} 
                      alt={`${style.name} style example`} 
                      className="w-full h-32 object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <span className="font-medium mb-1">{style.name}</span>
                  <span className="text-sm text-gray-600 mb-2">{style.description}</span>
                  <div className="flex space-x-1 mt-1">
                    {style.colors.map((color, index) => (
                      <div 
                        key={index} 
                        className="w-6 h-6 rounded-full border border-gray-200" 
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Brand Color Palette</h2>
            {colorPalettes.length > 0 && !isGeneratingPalettes && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={regeneratePalettes}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} />
                <span>Regenerate Palettes</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Color Preferences Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Color Preferences</h3>
              <p className="text-gray-600 mb-4">
                Select colors that resonate with your brand. These will influence the AI-generated palettes.
              </p>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColorPreference(color)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.colorPreferences.includes(color)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Input
                  placeholder="Add a custom color (e.g., Turquoise, Peach)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={addCustomColor}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                You can add custom colors that aren't in the list above.
              </p>

              {formData.colorPreferences.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Your selected colors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.colorPreferences.map((color: string, index: number) => (
                      <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                        <span className="text-sm">{color}</span>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            const updatedColors = [...formData.colorPreferences];
                            updatedColors.splice(index, 1);
                            const updatedData = {
                              ...formData,
                              colorPreferences: updatedColors,
                            };
                            setFormData(updatedData);
                            onChange(updatedData);
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <CardFooter>
                  <Button
                    onClick={handleGeneratePalettes}
                    disabled={isGeneratingPalettes}
                    className="w-full"
                  >
                    {isGeneratingPalettes ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate New Palettes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </div>
            </div>

            {/* AI-Generated Palettes Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">AI-Generated Palettes</h3>
              <p className="text-gray-600 mb-4">
                Based on your visual style and color preferences, here are some AI-generated color palettes for your brand.
              </p>
              
              <ColorPaletteGenerator
                brandName={data.businessName || data.brandName || "Brand"}
                industry={data.industry || "General"}
                brandPersonality={formData.visualStyle || "modern"}
                onSelect={(palette) => {
                  // Update formData with the selected palette
                  const updatedData = {
                    ...formData,
                    aiGenerated: {
                      ...formData.aiGenerated,
                      colorPalette: palette
                    }
                  };
                  setFormData(updatedData);
                  onChange(updatedData);
                }}
                onPreferencesChange={(aestheticPreferences, colorPrefs) => {
                  // Update formData with the new preferences
                  const updatedData = {
                    ...formData,
                    // Update wizard's color preferences from the component
                    colorPreferences: colorPrefs,
                    // Save aesthetic preferences as inspiration keywords
                    inspirationKeywords: aestheticPreferences
                  };
                  console.log('Preferences changed, updating wizard data:', updatedData);
                  setFormData(updatedData);
                  
                  // Force an immediate save when preferences are loaded from assets
                  if (!prefLoadedFromAssets) {
                    console.log('First load from assets, forcing immediate save to project data');
                    setPrefLoadedFromAssets(true);
                    // Use forceSave=true to immediately persist to database
                    onChange(updatedData, true);
                  } else {
                    // Normal update during user interaction
                    onChange(updatedData);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Inspiration Keywords</h2>
          <p className="text-gray-600 mb-4">
            Add words that describe the feeling or aesthetic you want your brand to convey.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., Futuristic, Earthy, Sophisticated"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addKeyword}
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.inspirationKeywords.map((keyword: string, index: number) => (
                <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                  <span className="text-sm">{keyword}</span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => removeKeyword(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Visual Inspiration</h2>
          <p className="text-gray-600 mb-4">
            Optionally add links to images or websites that represent the visual style you're looking for.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Paste URL to inspiration image or website"
                value={newMoodboardUrl}
                onChange={(e) => setNewMoodboardUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMoodboardUrl();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addMoodboardUrl}
              >
                <Plus size={16} />
              </Button>
            </div>

            {formData.moodboardUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {formData.moodboardUrls.map((url: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center truncate">
                      <span className="truncate">{url}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <ExternalLink size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeMoodboardUrl(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No inspiration links added yet.
              </p>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Or upload your own inspiration images (coming soon)
              </p>
              <Button variant="outline" disabled className="cursor-not-allowed">
                <Upload size={16} className="mr-2" />
                Upload Images
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
