
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const industries = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Education",
  "Finance",
  "Food & Beverage",
  "Real Estate",
  "Travel",
  "Marketing",
  "Entertainment",
  "Fashion",
  "Fitness",
  "Other"
];

interface BusinessBasicsProps {
  data: any;
  onChange: (data: any) => void;
}

export const BusinessBasics = ({ data, onChange }: BusinessBasicsProps) => {
  const [formData, setFormData] = useState({
    industry: data.industry || "",
    businessName: data.businessName || "",
    productService: data.productService || "",
    uniqueSellingProposition: data.uniqueSellingProposition || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleIndustryChange = (value: string) => {
    const updatedData = { ...formData, industry: value };
    setFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Business Basics</h1>
        <p className="text-gray-600">
          Let's start by understanding the fundamentals of your business. This information will help us create a brand that truly represents what you do.
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="industry">
            What industry are you in? <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.industry}
            onValueChange={handleIndustryChange}
          >
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Selecting the right industry helps us understand your market context.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">
            Company or Product Name (if decided)
          </Label>
          <Input
            id="businessName"
            name="businessName"
            placeholder="e.g., Acme Inc. or leave blank for name suggestions"
            value={formData.businessName}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500">
            If you haven't decided on a name yet, we'll help you generate ideas later.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productService">
            What products or services do you offer? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="productService"
            name="productService"
            placeholder="Describe your core products or services"
            value={formData.productService}
            onChange={handleChange}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            Be specific about what you provide to your customers.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="uniqueSellingProposition">
            What makes your business unique? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="uniqueSellingProposition"
            name="uniqueSellingProposition"
            placeholder="What sets you apart from competitors?"
            value={formData.uniqueSellingProposition}
            onChange={handleChange}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500">
            This is your Unique Selling Proposition (USP). What makes customers choose you over alternatives?
          </p>
        </div>
      </div>
    </div>
  );
};
