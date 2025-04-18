import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus, Sparkles, RefreshCw } from "lucide-react";
import { useAIGeneration } from "@/hooks/use-ai-generation";
import { toast } from "@/components/ui/use-toast";

interface BrandStoryData {
  [key: string]: unknown;  // Add index signature
  mission: string;
  vision: string;
  values: string[];
  originStory: string;
  industry?: string;
  businessName?: string;
  productService?: string;
  demographics?: string;
  personalityTraits?: string;
}

interface BrandStoryProps {
  data: BrandStoryData;
  onChange: (data: BrandStoryData) => void;
}

export const BrandStory = ({ data, onChange }: BrandStoryProps) => {
  const [formData, setFormData] = useState({
    mission: data.mission || "",
    vision: data.vision || "",
    values: data.values || [],
    originStory: data.originStory || "",
  });

  const [newValue, setNewValue] = useState("");
  const { generate, isGenerating } = useAIGeneration();

  // Track loading state for each section separately
  const [loadingStates, setLoadingStates] = useState({
    mission: false,
    vision: false,
    values: false,
    originStory: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const addValue = () => {
    if (!newValue.trim()) return;

    const updatedData = {
      ...formData,
      values: [...formData.values, newValue],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewValue("");
  };

  const removeValue = (index: number) => {
    const updatedValues = [...formData.values];
    updatedValues.splice(index, 1);

    const updatedData = {
      ...formData,
      values: updatedValues,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleGenerate = async (type: 'mission' | 'vision' | 'values' | 'originStory') => {
    const projectData = {
      industry: data.industry || 'technology',
      name: data.businessName || 'Your Business',
      productService: data.productService || 'provides innovative solutions',
      targetAudience: data.demographics || {},
      brandPersonality: data.personalityTraits || {}
    };

    // Set loading state for this specific section
    setLoadingStates(prev => ({ ...prev, [type]: true }));

    try {
      const content = await generate(type, projectData);
      if (content) {
        const updatedData = { ...formData };

        if (type === 'values') {
          // Parse values from the AI response with improved error handling
          const valuesList = content
            .split('\n')
            .filter(line => line.trim().startsWith('Value:'))
            .map(line => {
              const match = line.match(/Value:\s*(.*?)(?:\s*-\s*(.*))?$/);
              return match ? match[1].trim() : line.replace('Value:', '').trim();
            })
            .filter(value => value.length > 0);

          if (valuesList.length === 0) {
            throw new Error('No valid values were generated');
          }

          updatedData.values = valuesList;
        } else {
          if (!content.trim()) {
            throw new Error(`Generated ${type} is empty`);
          }
          updatedData[type] = content;
        }

        setFormData(updatedData);
        onChange(updatedData);
        toast({
          title: "Content Generated",
          description: `Your ${type === 'originStory' ? 'origin story' : type} has been generated successfully.`,
        });
      }
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Brand Story & Values</h1>
        <p className="text-gray-600">
          Define your brand's purpose and core values. Use AI suggestions to help craft your story.
        </p>
      </div>

      <div className="grid gap-8 max-w-2xl mx-auto">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="mission">
              Mission Statement <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate('mission')}
              disabled={loadingStates.mission}
            >
              {loadingStates.mission ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : formData.mission ? (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="mission"
            name="mission"
            placeholder="Why does your brand exist? What problem are you solving?"
            value={formData.mission}
            onChange={handleChange}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            Your mission statement explains why your company exists and what purpose it serves.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="vision">
              Vision Statement <span className="text-red-500">*</span>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate('vision')}
              disabled={loadingStates.vision}
            >
              {loadingStates.vision ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : formData.vision ? (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="vision"
            name="vision"
            placeholder="What does the future look like if your brand succeeds?"
            value={formData.vision}
            onChange={handleChange}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            Your vision statement describes the future your brand is working to create.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="values">Core Values</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate('values')}
              disabled={loadingStates.values}
            >
              {loadingStates.values ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : formData.values.length > 0 ? (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate Values
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate Values
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="values"
              placeholder="e.g., Innovation, Sustainability, Empowerment"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addValue();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={addValue}
            >
              <Plus size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.values.map((value: string, index: number) => (
              <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                <span className="text-sm">{value}</span>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removeValue(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            The fundamental beliefs that guide your brand's actions and decisions.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="originStory">Origin Story</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGenerate('originStory')}
              disabled={loadingStates.originStory}
            >
              {loadingStates.originStory ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : formData.originStory ? (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <Textarea
            id="originStory"
            name="originStory"
            placeholder="How did your brand come to be? What inspired its creation?"
            value={formData.originStory}
            onChange={handleChange}
            className="min-h-[150px]"
          />
          <p className="text-xs text-gray-500">
            Share the story of how your brand started and the journey that led to its creation.
          </p>
        </div>
      </div>
    </div>
  );
};
