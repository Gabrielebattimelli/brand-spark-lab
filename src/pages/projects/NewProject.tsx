
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { createProject, error } = useProjects();

  console.log("NewProject - user:", user);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!user) {
        console.log("NewProject - user not authenticated");
        toast.error("You must be logged in to create a project. Please log in and try again.");
        navigate("/login");
        return;
      }

      console.log("NewProject - creating project with data:", projectData);

      // Create project in the database
      toast.loading("Creating your project...");

      const newProject = await createProject({
        name: projectData.name,
        industry: projectData.industry,
        description: projectData.description || undefined
      });

      if (newProject) {
        // Navigate to the wizard with the new project ID
        console.log("NewProject - project created successfully:", newProject);
        toast.dismiss();
        toast.success("Project created successfully!");
        navigate(`/projects/${newProject.id}/wizard`);
      } else {
        console.error("NewProject - createProject returned null");
        toast.dismiss();
        throw new Error("Failed to create project - no project returned");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.dismiss();

      // Show a more detailed error message
      let errorMessage = "Failed to create project. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Failed to create project: ${error.message}`;
      }

      toast.error(errorMessage);

      // Add a suggestion for the user
      if (errorMessage.includes("no project returned")) {
        toast.error("This might be a temporary issue. Please try again in a few moments.", {
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
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
