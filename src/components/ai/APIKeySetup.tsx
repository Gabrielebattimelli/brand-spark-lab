import React, { useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Key } from "lucide-react";

interface APIKeySetupProps {
  onComplete: () => void;
}

export const APIKeySetup: React.FC<APIKeySetupProps> = ({ onComplete }) => {
  const { 
    geminiApiKey, setGeminiApiKey, 
    ideogramApiKey, setIdeogramApiKey,
    clipdropApiKey, setClipdropApiKey
  } = useAI();

  const [geminiKey, setGeminiKey] = useState(geminiApiKey);
  const [ideogramKey, setIdeogramKey] = useState(ideogramApiKey);
  const [clipdropKey, setClipdropKey] = useState(clipdropApiKey);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!geminiKey.trim()) {
      setError("Gemini API key is required");
      return;
    }

    // Either Ideogram or ClipDrop API key is required
    if (!ideogramKey.trim() && !clipdropKey.trim()) {
      setError("Either Ideogram or ClipDrop API key is required for image generation");
      return;
    }

    setIsSubmitting(true);

    // In a real app, you might validate the API keys here
    // For this demo, we'll just simulate a delay
    setTimeout(() => {
      setGeminiApiKey(geminiKey);
      setIdeogramApiKey(ideogramKey);
      setClipdropApiKey(clipdropKey);
      setIsSubmitting(false);
      onComplete();
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Setup
        </CardTitle>
        <CardDescription>
          Enter your API keys to enable AI-powered brand generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Used for generating brand names, mission statements, and other text content
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ideogram-api-key">Ideogram API Key</Label>
            <Input
              id="ideogram-api-key"
              type="password"
              placeholder="Enter your Ideogram API key"
              value={ideogramKey}
              onChange={(e) => setIdeogramKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Used for generating logo concepts and visual brand elements
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clipdrop-api-key">ClipDrop API Key</Label>
            <Input
              id="clipdrop-api-key"
              type="password"
              placeholder="Enter your ClipDrop API key"
              value={clipdropKey}
              onChange={(e) => setClipdropKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Alternative option for generating logo concepts and visual brand elements
            </p>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-gray-500">
        Your API keys are stored locally and never sent to our servers
      </CardFooter>
    </Card>
  );
};
