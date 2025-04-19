import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAI } from "@/contexts/AIContext";
import { User, UserIcon, Key, Eye, EyeOff, Save } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    geminiApiKey, setGeminiApiKey,
    ideogramApiKey, setIdeogramApiKey,
    clipdropApiKey, setClipdropApiKey
  } = useAI();

  // User profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // API keys visibility state
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showIdeogramKey, setShowIdeogramKey] = useState(false);
  const [showClipdropKey, setShowClipdropKey] = useState(false);

  // Local state for API keys
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiApiKey);
  const [localIdeogramKey, setLocalIdeogramKey] = useState(ideogramApiKey);
  const [localClipdropKey, setLocalClipdropKey] = useState(clipdropApiKey);
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Get user metadata (name) if available
      const metadata = user.user_metadata;
      if (metadata && metadata.name) {
        setName(metadata.name);
      }
    }
  }, [user]);
  
  // Update local key state when context values change
  useEffect(() => {
    setLocalGeminiKey(geminiApiKey || "");
    setLocalIdeogramKey(ideogramApiKey || "");
    setLocalClipdropKey(clipdropApiKey || "");
  }, [geminiApiKey, ideogramApiKey, clipdropApiKey]);

  // Save profile changes
  const handleSaveProfile = async () => {
    // In a real implementation, this would update the user's profile in Supabase
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  // Save API keys
  const handleSaveApiKeys = async () => {
    setIsSavingKeys(true);
    
    try {
      // Call the context methods which will save to Supabase
      setGeminiApiKey(localGeminiKey);
      setIdeogramApiKey(localIdeogramKey);
      setClipdropApiKey(localClipdropKey);
      
      toast({
        title: "API keys updated",
        description: "Your API keys have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error saving API keys",
        description: "There was a problem saving your API keys. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingKeys(false);
    }
  };

  return (
    <>
      <Navbar isAuthenticated={true} />
      <div className="min-h-screen bg-gray-50 pt-20 pb-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="flex items-center">
                <User size={16} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center">
                <Key size={16} className="mr-2" />
                API Keys
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      disabled
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile} className="flex items-center">
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for various AI services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gemini API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="gemini-api-key">Google Gemini API Key</Label>
                    <div className="flex">
                      <Input
                        id="gemini-api-key"
                        type={showGeminiKey ? "text" : "password"}
                        value={localGeminiKey}
                        onChange={(e) => setLocalGeminiKey(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="ml-2"
                      >
                        {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Used for generating brand text content. Get your API key from{" "}
                      <a
                        href="https://ai.google.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>

                  {/* Ideogram API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="ideogram-api-key">Ideogram API Key</Label>
                    <div className="flex">
                      <Input
                        id="ideogram-api-key"
                        type={showIdeogramKey ? "text" : "password"}
                        value={localIdeogramKey}
                        onChange={(e) => setLocalIdeogramKey(e.target.value)}
                        placeholder="Enter your Ideogram API key"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowIdeogramKey(!showIdeogramKey)}
                        className="ml-2"
                      >
                        {showIdeogramKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Used for generating logo images. Get your API key from{" "}
                      <a
                        href="https://ideogram.ai/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ideogram
                      </a>
                    </p>
                  </div>

                  {/* Clipdrop API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="clipdrop-api-key">Clipdrop API Key</Label>
                    <div className="flex">
                      <Input
                        id="clipdrop-api-key"
                        type={showClipdropKey ? "text" : "password"}
                        value={localClipdropKey}
                        onChange={(e) => setLocalClipdropKey(e.target.value)}
                        placeholder="Enter your Clipdrop API key"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowClipdropKey(!showClipdropKey)}
                        className="ml-2"
                      >
                        {showClipdropKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Used for image processing. Get your API key from{" "}
                      <a
                        href="https://clipdrop.co/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Clipdrop
                      </a>
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveApiKeys} 
                    className="flex items-center"
                    disabled={isSavingKeys}
                  >
                    {isSavingKeys ? (
                      <>
                        <div className="animate-spin mr-2">⟳</div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save API Keys
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}