
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface BrandStoryProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandStory = ({ data, onChange }: BrandStoryProps) => {
  const [formData, setFormData] = useState({
    mission: data.mission || "",
    vision: data.vision || "",
    values: data.values || [],
    originStory: data.originStory || "",
  });

  const [newValue, setNewValue] = useState("");

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

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Brand Story & Values</h1>
        <p className="text-gray-600">
          Your brand story and values form the foundation of your brand's identity and purpose. This is what connects your audience to your brand on a deeper level.
        </p>
      </div>

      <div className="grid gap-8 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="mission">
            Mission Statement <span className="text-red-500">*</span>
          </Label>
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
          <Label htmlFor="vision">
            Vision Statement <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="vision"
            name="vision"
            placeholder="What does the future look like if your brand succeeds? What change will you create?"
            value={formData.vision}
            onChange={handleChange}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            Your vision statement describes the future your brand is working to create.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="values">Core Values</Label>
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
          <Label htmlFor="originStory">Origin Story</Label>
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
