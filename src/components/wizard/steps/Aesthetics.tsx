
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { X, Plus, Upload, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AestheticsProps {
  data: any;
  onChange: (data: any) => void;
}

const visualStyles = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, simple, and uncluttered design with ample white space."
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong colors, distinctive typography, and eye-catching elements."
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined, sophisticated aesthetic with premium feel."
  },
  {
    id: "retro",
    name: "Retro",
    description: "Vintage-inspired design elements that evoke nostalgia."
  },
  {
    id: "techy",
    name: "Tech-Forward",
    description: "Modern, cutting-edge look with digital elements and futuristic aesthetics."
  },
  {
    id: "playful",
    name: "Playful",
    description: "Fun, vibrant design with whimsical elements and creative touches."
  },
  {
    id: "organic",
    name: "Organic/Natural",
    description: "Nature-inspired design with earthy tones and organic shapes."
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional, polished look suitable for traditional business environments."
  }
];

const colorOptions = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", 
  "Brown", "Gray", "Black", "White", "Gold", "Silver", "Teal", 
  "Navy", "Burgundy", "Mint", "Coral", "Lavender"
];

export const Aesthetics = ({ data, onChange }: AestheticsProps) => {
  const [formData, setFormData] = useState({
    visualStyle: data.visualStyle || "",
    colorPreferences: data.colorPreferences || [],
    inspirationKeywords: data.inspirationKeywords || [],
    moodboardUrls: data.moodboardUrls || [],
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [newMoodboardUrl, setNewMoodboardUrl] = useState("");
  const [newColor, setNewColor] = useState("");

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
                  <span className="font-medium mb-1">{style.name}</span>
                  <span className="text-sm text-gray-600">{style.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Color Preferences</h2>
          <p className="text-gray-600 mb-6">
            Select colors that resonate with your brand. Your brand kit will include #f38e63 as a primary color, along with complementary colors.
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
