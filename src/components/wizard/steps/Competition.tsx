
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CompetitionProps {
  data: any;
  onChange: (data: any) => void;
}

interface Competitor {
  name: string;
  strengths: string;
  weaknesses: string;
}

export const Competition = ({ data, onChange }: CompetitionProps) => {
  const [formData, setFormData] = useState({
    competitors: data.competitors || [],
    differentiators: data.differentiators || [],
  });

  const [newCompetitor, setNewCompetitor] = useState<Competitor>({ 
    name: "", 
    strengths: "", 
    weaknesses: "" 
  });
  const [newDifferentiator, setNewDifferentiator] = useState("");
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);

  const handleCompetitorChange = (field: keyof Competitor, value: string) => {
    setNewCompetitor({
      ...newCompetitor,
      [field]: value,
    });
  };

  const addCompetitor = () => {
    if (!newCompetitor.name.trim()) return;
    
    const updatedData = {
      ...formData,
      competitors: [...formData.competitors, newCompetitor],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewCompetitor({ name: "", strengths: "", weaknesses: "" });
    setIsAddingCompetitor(false);
  };

  const removeCompetitor = (index: number) => {
    const updatedCompetitors = [...formData.competitors];
    updatedCompetitors.splice(index, 1);
    
    const updatedData = {
      ...formData,
      competitors: updatedCompetitors,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const addDifferentiator = () => {
    if (!newDifferentiator.trim()) return;
    
    const updatedData = {
      ...formData,
      differentiators: [...formData.differentiators, newDifferentiator],
    };
    setFormData(updatedData);
    onChange(updatedData);
    setNewDifferentiator("");
  };

  const removeDifferentiator = (index: number) => {
    const updatedDifferentiators = [...formData.differentiators];
    updatedDifferentiators.splice(index, 1);
    
    const updatedData = {
      ...formData,
      differentiators: updatedDifferentiators,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Competitive Landscape</h1>
        <p className="text-gray-600">
          Analyzing your competition helps position your brand effectively in the market and identify your unique advantages.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Key Competitors</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCompetitor(true)}
              className={isAddingCompetitor ? "hidden" : ""}
            >
              <Plus size={16} className="mr-1" />
              Add Competitor
            </Button>
          </div>

          {isAddingCompetitor && (
            <Card className="mb-4 border-dashed animate-scale-in">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competitor-name">Competitor Name</Label>
                    <Input
                      id="competitor-name"
                      placeholder="e.g., Competitor Inc."
                      value={newCompetitor.name}
                      onChange={(e) => handleCompetitorChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitor-strengths">Their Strengths</Label>
                    <Textarea
                      id="competitor-strengths"
                      placeholder="What does this competitor do well?"
                      value={newCompetitor.strengths}
                      onChange={(e) => handleCompetitorChange("strengths", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="competitor-weaknesses">Their Weaknesses</Label>
                    <Textarea
                      id="competitor-weaknesses"
                      placeholder="Where does this competitor fall short?"
                      value={newCompetitor.weaknesses}
                      onChange={(e) => handleCompetitorChange("weaknesses", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingCompetitor(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={addCompetitor}
                      disabled={!newCompetitor.name.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.competitors.length === 0 && !isAddingCompetitor ? (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-3">No competitors added yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingCompetitor(true)}
              >
                <Plus size={16} className="mr-1" />
                Add Your First Competitor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.competitors.map((competitor: Competitor, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{competitor.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetitor(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Strengths:</p>
                        <p className="text-sm text-gray-600">{competitor.strengths || "None specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Weaknesses:</p>
                        <p className="text-sm text-gray-600">{competitor.weaknesses || "None specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Differentiators</h2>
          <p className="text-gray-600 mb-4">
            What makes your brand stand out from the competition? These are the unique advantages and qualities that set you apart.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="e.g., Proprietary technology, Superior customer service"
                value={newDifferentiator}
                onChange={(e) => setNewDifferentiator(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDifferentiator();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addDifferentiator}
              >
                <Plus size={16} />
              </Button>
            </div>

            {formData.differentiators.length > 0 ? (
              <div className="space-y-2">
                {formData.differentiators.map((differentiator: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                    <span>{differentiator}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDifferentiator(index)}
                      className="text-gray-500 hover:text-red-500 h-auto p-1"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic py-2">
                No differentiators added yet. What makes your brand special?
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
