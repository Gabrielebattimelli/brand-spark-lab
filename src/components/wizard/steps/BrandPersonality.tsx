
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface BrandPersonalityProps {
  data: any;
  onChange: (data: any) => void;
}

const archetypes = [
  {
    id: "innocent",
    name: "The Innocent",
    description: "Optimistic, honest, pure. Believes in happiness and goodness.",
    examples: "Coca-Cola, Dove, Disney"
  },
  {
    id: "sage",
    name: "The Sage",
    description: "Analytical, wise, knowledgeable. Values truth and understanding.",
    examples: "Google, BBC, Harvard"
  },
  {
    id: "explorer",
    name: "The Explorer",
    description: "Adventurous, ambitious, independent. Seeks new experiences.",
    examples: "REI, Jeep, National Geographic"
  },
  {
    id: "ruler",
    name: "The Ruler",
    description: "Authoritative, responsible, organized. Values control and leadership.",
    examples: "Microsoft, Mercedes-Benz, American Express"
  },
  {
    id: "creator",
    name: "The Creator",
    description: "Innovative, artistic, inventive. Values imagination and self-expression.",
    examples: "Adobe, Lego, Apple"
  },
  {
    id: "caregiver",
    name: "The Caregiver",
    description: "Nurturing, generous, compassionate. Wants to protect and care for others.",
    examples: "Johnson & Johnson, UNICEF, Volvo"
  },
  {
    id: "magician",
    name: "The Magician",
    description: "Visionary, spiritual, transformative. Promises transformation and magical experiences.",
    examples: "Disney, Mastercard, Tesla"
  },
  {
    id: "hero",
    name: "The Hero",
    description: "Courageous, honest, determined. Overcomes challenges to improve the world.",
    examples: "Nike, FedEx, U.S. Army"
  },
  {
    id: "outlaw",
    name: "The Outlaw",
    description: "Rebellious, revolutionary, iconoclastic. Breaks rules and challenges conventions.",
    examples: "Harley-Davidson, Virgin, Red Bull"
  },
  {
    id: "lover",
    name: "The Lover",
    description: "Passionate, sensual, intimate. Values relationships and emotional connections.",
    examples: "Victoria's Secret, Godiva, Chanel"
  },
  {
    id: "jester",
    name: "The Jester",
    description: "Playful, humorous, spontaneous. Lives in the moment and brings joy.",
    examples: "Old Spice, M&M's, Dollar Shave Club"
  },
  {
    id: "everyman",
    name: "The Everyman",
    description: "Relatable, authentic, friendly. Values connection and belonging.",
    examples: "IKEA, Target, Budweiser"
  }
];

export const BrandPersonality = ({ data, onChange }: BrandPersonalityProps) => {
  const [formData, setFormData] = useState({
    personalityTraits: {
      playfullnessVsSerious: data.personalityTraits?.playfullnessVsSerious || 50,
      modernVsTraditional: data.personalityTraits?.modernVsTraditional || 50,
      luxuriousVsAccessible: data.personalityTraits?.luxuriousVsAccessible || 50,
      boldVsSubtle: data.personalityTraits?.boldVsSubtle || 50,
      formalVsRelaxed: data.personalityTraits?.formalVsRelaxed || 50,
    },
    selectedArchetype: data.selectedArchetype || "",
  });

  const handleTraitChange = (trait: string, value: number) => {
    const updatedData = {
      ...formData,
      personalityTraits: {
        ...formData.personalityTraits,
        [trait]: value,
      },
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleArchetypeChange = (value: string) => {
    const updatedData = {
      ...formData,
      selectedArchetype: value,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const getTraitLeftLabel = (trait: string) => {
    switch (trait) {
      case "playfullnessVsSerious":
        return "Playful";
      case "modernVsTraditional":
        return "Modern";
      case "luxuriousVsAccessible":
        return "Luxurious";
      case "boldVsSubtle":
        return "Bold";
      case "formalVsRelaxed":
        return "Formal";
      default:
        return "";
    }
  };

  const getTraitRightLabel = (trait: string) => {
    switch (trait) {
      case "playfullnessVsSerious":
        return "Serious";
      case "modernVsTraditional":
        return "Traditional";
      case "luxuriousVsAccessible":
        return "Accessible";
      case "boldVsSubtle":
        return "Subtle";
      case "formalVsRelaxed":
        return "Relaxed";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Brand Personality</h1>
        <p className="text-gray-600">
          Define the character and emotional tone of your brand. This will guide how your brand communicates and connects with your audience.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Personality Traits</h2>
          <p className="text-gray-600 mb-6">
            Use these sliders to position your brand on each spectrum.
          </p>
          
          <div className="space-y-8">
            {Object.keys(formData.personalityTraits).map((trait) => (
              <div key={trait} className="space-y-2">
                <div className="flex justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {getTraitLeftLabel(trait)}
                  </Label>
                  <Label className="text-sm font-medium">
                    {getTraitRightLabel(trait)}
                  </Label>
                </div>
                <Slider
                  value={[formData.personalityTraits[trait as keyof typeof formData.personalityTraits]]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleTraitChange(trait, value[0])}
                  className="py-1"
                />
                <div className="flex justify-between mt-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Brand Archetype</h2>
          <p className="text-gray-600 mb-6">
            Select the archetype that best represents your brand's core identity and purpose.
          </p>
          
          <RadioGroup
            value={formData.selectedArchetype}
            onValueChange={handleArchetypeChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {archetypes.map((archetype) => (
              <div key={archetype.id} className="relative">
                <RadioGroupItem
                  value={archetype.id}
                  id={archetype.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={archetype.id}
                  className="flex flex-col p-4 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium mb-1">{archetype.name}</span>
                  <span className="text-sm text-gray-600 mb-2">{archetype.description}</span>
                  <span className="text-xs text-gray-500">Examples: {archetype.examples}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
