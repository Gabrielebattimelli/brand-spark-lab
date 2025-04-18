
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";

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

export default function NewProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    industry: "",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIndustryChange = (value: string) => {
    setProjectData((prev) => ({ ...prev, industry: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to the wizard with the new project ID
      // In a real app, this would create a project in the backend and return an ID
      navigate("/projects/new-project/wizard");
    }, 1000);
  };

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <CardTitle>Create New Branding Project</CardTitle>
              </div>
              <CardDescription>
                Start your branding journey by setting up a new project.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., My Startup Brand"
                    value={projectData.name}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Give your project a name that helps you identify it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={projectData.industry}
                    onValueChange={handleIndustryChange}
                    required
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Project Description (optional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of your brand or product..."
                    value={projectData.description}
                    onChange={handleChange}
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !projectData.name || !projectData.industry}
                >
                  {loading ? "Creating..." : "Create & Start Brand Wizard"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
