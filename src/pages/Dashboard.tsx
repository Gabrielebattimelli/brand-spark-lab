
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowRight, Clock, Check, AlertTriangle } from "lucide-react";
import { useProjects, Project as ProjectType } from "@/hooks/use-projects";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Project extends ProjectType {
  lastUpdated: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProjects, loading: projectsLoading } = useProjects();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("Dashboard - user:", user);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if user is authenticated
        if (!user) {
          console.log("Dashboard - user not authenticated, waiting...");
          setLoading(false); // Set loading to false if no user
          // We'll let the ProtectedRoute handle the redirect
          return;
        }

        console.log("Dashboard - loading projects for user:", user.id);
        const fetchedProjects = await getProjects();
        console.log("Dashboard - fetched projects:", fetchedProjects);

        // Transform projects to include lastUpdated
        const formattedProjects = fetchedProjects.map(project => ({
          ...project,
          lastUpdated: formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })
        }));

        setProjects(formattedProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setError("Failed to load projects. Please try refreshing the page.");
      } finally {
        setLoading(false);
        console.log("Dashboard - finished loading projects, loading set to false");
      }
    };

    loadProjects();
  }, [getProjects, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Clock size={16} className="text-primary" />;
      case "completed":
        return <Check size={16} className="text-green-500" />;
      case "draft":
        return <AlertTriangle size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage your branding projects</p>
            </div>
            <Button 
              onClick={() => navigate("/projects/new")}
              className="mt-4 md:mt-0"
            >
              <Plus size={16} className="mr-1" />
              New Project
            </Button>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">Loading your projects...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg border border-red-200 p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">
                  <AlertTriangle size={32} />
                </div>
                <p className="text-red-600 mb-2">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3">No projects yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first brand project to get started with BrandIt.
                </p>
                <Button onClick={() => navigate("/projects/new")}>
                  <Plus size={16} className="mr-1" />
                  Create First Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <CardDescription className="flex items-center text-sm">
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{getStatusText(project.status)}</span>
                      <span className="mx-2">•</span>
                      <span>Updated {project.lastUpdated}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${project.completion_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {project.completion_percentage}% Complete
                    </p>
                  </CardContent>
                  <CardFooter className="pt-1 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}/wizard`)}
                    >
                      Continue
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
