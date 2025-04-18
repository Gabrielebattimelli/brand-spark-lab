
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TargetAudienceProps {
  data: any;
  onChange: (data: any) => void;
}

export const TargetAudience = ({ data, onChange }: TargetAudienceProps) => {
  const [formData, setFormData] = useState({
    demographics: {
      ageRange: data.demographics?.ageRange || "",
      gender: data.demographics?.gender || "",
      location: data.demographics?.location || "",
      income: data.demographics?.income || "",
      education: data.demographics?.education || "",
    },
    psychographics: {
      interests: data.psychographics?.interests || [],
      values: data.psychographics?.values || [],
      painPoints: data.psychographics?.painPoints || [],
      goals: data.psychographics?.goals || [],
    },
  });

  const [newInterest, setNewInterest] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newPainPoint, setNewPainPoint] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      demographics: {
        ...formData.demographics,
        [name]: value,
      },
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const addItem = (category: string, item: string) => {
    if (!item.trim()) return;
    
    const updatedData = {
      ...formData,
      psychographics: {
        ...formData.psychographics,
        [category]: [...formData.psychographics[category as keyof typeof formData.psychographics], item],
      },
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const removeItem = (category: string, index: number) => {
    const updatedItems = [...formData.psychographics[category as keyof typeof formData.psychographics]];
    updatedItems.splice(index, 1);
    
    const updatedData = {
      ...formData,
      psychographics: {
        ...formData.psychographics,
        [category]: updatedItems,
      },
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Target Audience</h1>
        <p className="text-gray-600">
          Understanding who your brand speaks to is crucial. Define your ideal customers to help craft a brand that resonates with them.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Demographics</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Select
                  value={formData.demographics.ageRange}
                  onValueChange={(value) => 
                    handleDemographicsChange({ target: { name: "ageRange", value } } as any)
                  }
                >
                  <SelectTrigger id="ageRange">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55-64">55-64</SelectItem>
                    <SelectItem value="65+">65+</SelectItem>
                    <SelectItem value="All ages">All ages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.demographics.gender}
                  onValueChange={(value) => 
                    handleDemographicsChange({ target: { name: "gender", value } } as any)
                  }
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primarily male">Primarily male</SelectItem>
                    <SelectItem value="Primarily female">Primarily female</SelectItem>
                    <SelectItem value="All genders equally">All genders equally</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Geographic Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Global, United States, Urban areas"
                value={formData.demographics.location}
                onChange={handleDemographicsChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income">Income Level</Label>
                <Select
                  value={formData.demographics.income}
                  onValueChange={(value) => 
                    handleDemographicsChange({ target: { name: "income", value } } as any)
                  }
                >
                  <SelectTrigger id="income">
                    <SelectValue placeholder="Select income level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lower income">Lower income</SelectItem>
                    <SelectItem value="Middle income">Middle income</SelectItem>
                    <SelectItem value="Upper middle income">Upper middle income</SelectItem>
                    <SelectItem value="High income">High income</SelectItem>
                    <SelectItem value="All income levels">All income levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education Level</Label>
                <Select
                  value={formData.demographics.education}
                  onValueChange={(value) => 
                    handleDemographicsChange({ target: { name: "education", value } } as any)
                  }
                >
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High school">High school</SelectItem>
                    <SelectItem value="Some college">Some college</SelectItem>
                    <SelectItem value="Bachelor's degree">Bachelor's degree</SelectItem>
                    <SelectItem value="Advanced degree">Advanced degree</SelectItem>
                    <SelectItem value="All education levels">All education levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Psychographics</h2>
          
          <div className="space-y-6">
            {/* Interests */}
            <div className="space-y-2">
              <Label htmlFor="interests">Interests & Hobbies</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="interests"
                  placeholder="e.g., Technology, Outdoor activities"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('interests', newInterest);
                      setNewInterest('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    addItem('interests', newInterest);
                    setNewInterest('');
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.psychographics.interests.map((interest: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <span className="text-sm">{interest}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => removeItem('interests', index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Values */}
            <div className="space-y-2">
              <Label htmlFor="values">Core Values</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="values"
                  placeholder="e.g., Sustainability, Innovation"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('values', newValue);
                      setNewValue('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    addItem('values', newValue);
                    setNewValue('');
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.psychographics.values.map((value: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <span className="text-sm">{value}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => removeItem('values', index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="space-y-2">
              <Label htmlFor="painPoints">Pain Points</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="painPoints"
                  placeholder="e.g., Lack of time, Budget constraints"
                  value={newPainPoint}
                  onChange={(e) => setNewPainPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('painPoints', newPainPoint);
                      setNewPainPoint('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    addItem('painPoints', newPainPoint);
                    setNewPainPoint('');
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.psychographics.painPoints.map((painPoint: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <span className="text-sm">{painPoint}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => removeItem('painPoints', index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Aspirations</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="goals"
                  placeholder="e.g., Career advancement, Work-life balance"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('goals', newGoal);
                      setNewGoal('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    addItem('goals', newGoal);
                    setNewGoal('');
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.psychographics.goals.map((goal: string, index: number) => (
                  <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <span className="text-sm">{goal}</span>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => removeItem('goals', index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
