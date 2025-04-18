import React, { useState } from "react";
import { useAI } from "@/contexts/AIContext";
import { 
  generateMissionStatements, 
  generateVisionStatements,
  generateValuePropositions,
  generateBrandEssence,
  generateBrandVoice
} from "@/integrations/ai/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Copy, ChevronDown, ChevronUp } from "lucide-react";

type StatementType = "mission" | "vision" | "valueProposition" | "brandEssence" | "brandVoice";

interface BrandStatementGeneratorProps {
  brandName: string;
  industry: string;
  targetAudience: string;
  values: string[];
  uniqueSellingPoints: string[];
  onSelectMission: (statement: string) => void;
  onSelectVision: (statement: string) => void;
  onSelectValueProposition: (statement: string) => void;
  onSelectBrandEssence: (statement: string) => void;
  onSelectBrandVoice: (statement: string) => void;
}

export const BrandStatementGenerator: React.FC<BrandStatementGeneratorProps> = ({
  brandName,
  industry,
  targetAudience,
  values,
  uniqueSellingPoints,
  onSelectMission,
  onSelectVision,
  onSelectValueProposition,
  onSelectBrandEssence,
  onSelectBrandVoice
}) => {
  const { 
    geminiApiKey,

    generatedMissionStatements, 
    setGeneratedMissionStatements,
    generatedMissionStatementsWithExplanations,
    setGeneratedMissionStatementsWithExplanations,
    selectedMissionStatement,
    setSelectedMissionStatement,
    selectedMissionStatementExplanation,
    setSelectedMissionStatementExplanation,

    generatedVisionStatements, 
    setGeneratedVisionStatements,
    generatedVisionStatementsWithExplanations,
    setGeneratedVisionStatementsWithExplanations,
    selectedVisionStatement,
    setSelectedVisionStatement,
    selectedVisionStatementExplanation,
    setSelectedVisionStatementExplanation,

    generatedValuePropositions,
    setGeneratedValuePropositions,
    generatedValuePropositionsWithExplanations,
    setGeneratedValuePropositionsWithExplanations,
    selectedValueProposition,
    setSelectedValueProposition,
    selectedValuePropositionExplanation,
    setSelectedValuePropositionExplanation,

    generatedBrandEssence,
    setGeneratedBrandEssence,
    generatedBrandEssenceWithExplanations,
    setGeneratedBrandEssenceWithExplanations,
    selectedBrandEssence,
    setSelectedBrandEssence,
    selectedBrandEssenceExplanation,
    setSelectedBrandEssenceExplanation,

    generatedBrandVoice,
    setGeneratedBrandVoice,
    generatedBrandVoiceCharacteristics,
    setGeneratedBrandVoiceCharacteristics,
    selectedBrandVoice,
    setSelectedBrandVoice,
    selectedBrandVoiceExplanation,
    setSelectedBrandVoiceExplanation,

    isGeneratingText,
    setIsGeneratingText
  } = useAI();

  const [activeTab, setActiveTab] = useState<StatementType>("mission");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [expandedStatements, setExpandedStatements] = useState<Record<string, boolean>>({});

  // Track loading state for each section separately
  const [loadingStates, setLoadingStates] = useState({
    mission: false,
    vision: false,
    valueProposition: false,
    brandEssence: false,
    brandVoice: false
  });

  const handleGenerateStatements = async (type: StatementType) => {
    if (!geminiApiKey) {
      setError("Gemini API key is required to generate brand statements");
      return;
    }

    if (!brandName) {
      setError("Brand name is required to generate statements");
      return;
    }

    setError(null);
    // Set loading state for this specific section
    setLoadingStates(prev => ({ ...prev, [type]: true }));

    try {
      let statements: string[] = [];

      // Generate statements based on type
      if (type === "mission") {
        const statementsWithExplanations = await generateMissionStatements(
          geminiApiKey,
          brandName,
          industry,
          targetAudience,
          values
        );

        // Extract just the statements for backward compatibility
        statements = statementsWithExplanations.map(item => item.statement);
        setGeneratedMissionStatements(statements);
        setGeneratedMissionStatementsWithExplanations(statementsWithExplanations);

        // If no mission is selected yet, select the first one
        if (!selectedMissionStatement && statements.length > 0) {
          setSelectedMissionStatement(statements[0]);
          setSelectedMissionStatementExplanation(statementsWithExplanations[0].explanation);
          onSelectMission(statements[0]);
        }

        // Log for debugging
        console.log("[DEBUG_LOG] Mission statements generated:", statements);
        console.log("[DEBUG_LOG] Selected mission statement:", selectedMissionStatement);
      } 
      else if (type === "vision") {
        // Log current mission statement before generating vision
        console.log("[DEBUG_LOG] Current mission statement before vision generation:", selectedMissionStatement);

        const statementsWithExplanations = await generateVisionStatements(
          geminiApiKey,
          brandName,
          industry,
          selectedMissionStatement || "To provide excellent products and services"
        );

        // Extract just the statements for backward compatibility
        statements = statementsWithExplanations.map(item => item.statement);
        setGeneratedVisionStatements(statements);
        setGeneratedVisionStatementsWithExplanations(statementsWithExplanations);

        // If no vision is selected yet, select the first one
        if (!selectedVisionStatement && statements.length > 0) {
          setSelectedVisionStatement(statements[0]);
          setSelectedVisionStatementExplanation(statementsWithExplanations[0].explanation);
          onSelectVision(statements[0]);
        }

        // Log for debugging
        console.log("[DEBUG_LOG] Vision statements generated:", statements);
        console.log("[DEBUG_LOG] Selected vision statement:", selectedVisionStatement);
        console.log("[DEBUG_LOG] Mission statement after vision generation:", selectedMissionStatement);
      }
      else if (type === "valueProposition") {
        const statementsWithExplanations = await generateValuePropositions(
          geminiApiKey,
          brandName,
          industry,
          targetAudience,
          uniqueSellingPoints
        );

        // Extract just the statements for backward compatibility
        statements = statementsWithExplanations.map(item => item.statement);
        setGeneratedValuePropositions(statements);
        setGeneratedValuePropositionsWithExplanations(statementsWithExplanations);

        // If no value proposition is selected yet, select the first one
        if (!selectedValueProposition && statements.length > 0) {
          setSelectedValueProposition(statements[0]);
          setSelectedValuePropositionExplanation(statementsWithExplanations[0].explanation);
          onSelectValueProposition(statements[0]);
        }
      }
      else if (type === "brandEssence") {
        const statementsWithExplanations = await generateBrandEssence(
          geminiApiKey,
          brandName,
          industry,
          selectedMissionStatement || "To provide excellent products and services",
          selectedVisionStatement || "To be a leader in our industry",
          values
        );

        // Extract just the statements for backward compatibility
        statements = statementsWithExplanations.map(item => item.statement);
        setGeneratedBrandEssence(statements);
        setGeneratedBrandEssenceWithExplanations(statementsWithExplanations);

        // If no brand essence is selected yet, select the first one
        if (!selectedBrandEssence && statements.length > 0) {
          setSelectedBrandEssence(statements[0]);
          setSelectedBrandEssenceExplanation(statementsWithExplanations[0].explanation);
          onSelectBrandEssence(statements[0]);
        }
      }
      else if (type === "brandVoice") {
        const voiceCharacteristics = await generateBrandVoice(
          geminiApiKey,
          brandName,
          industry,
          targetAudience,
          values.join(", ")
        );

        // Extract just the characteristics for backward compatibility
        statements = voiceCharacteristics.map(item => item.characteristic);
        setGeneratedBrandVoice(statements);
        setGeneratedBrandVoiceCharacteristics(voiceCharacteristics);

        // If no brand voice is selected yet, select the first one
        if (!selectedBrandVoice && statements.length > 0) {
          setSelectedBrandVoice(statements[0]);
          setSelectedBrandVoiceExplanation(voiceCharacteristics[0].explanation);
          onSelectBrandVoice(statements[0]);
        }
      }
    } catch (err) {
      console.error(`Error generating ${type} statements:`, err);
      setError(`Failed to generate ${type} statements. This may be because the Edge Function hasn't been deployed. Please follow the instructions in DEPLOYMENT_GUIDE.md to deploy the updated Edge Function, then try again.`);
    } finally {
      // Reset loading state for this specific section
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSelectStatement = (type: StatementType, statement: string) => {
    switch (type) {
      case "mission": {
        setSelectedMissionStatement(statement);
        // Find the explanation for the selected statement
        const statementObj = generatedMissionStatementsWithExplanations.find(
          item => item.statement === statement
        );
        if (statementObj) {
          setSelectedMissionStatementExplanation(statementObj.explanation);
        }
        onSelectMission(statement);
        break;
      }
      case "vision": {
        setSelectedVisionStatement(statement);
        // Find the explanation for the selected statement
        const statementObj = generatedVisionStatementsWithExplanations.find(
          item => item.statement === statement
        );
        if (statementObj) {
          setSelectedVisionStatementExplanation(statementObj.explanation);
        }
        onSelectVision(statement);
        break;
      }
      case "valueProposition": {
        setSelectedValueProposition(statement);
        // Find the explanation for the selected statement
        const statementObj = generatedValuePropositionsWithExplanations.find(
          item => item.statement === statement
        );
        if (statementObj) {
          setSelectedValuePropositionExplanation(statementObj.explanation);
        }
        onSelectValueProposition(statement);
        break;
      }
      case "brandEssence": {
        setSelectedBrandEssence(statement);
        // Find the explanation for the selected statement
        const statementObj = generatedBrandEssenceWithExplanations.find(
          item => item.statement === statement
        );
        if (statementObj) {
          setSelectedBrandEssenceExplanation(statementObj.explanation);
        }
        onSelectBrandEssence(statement);
        break;
      }
      case "brandVoice": {
        setSelectedBrandVoice(statement);
        // Find the explanation for the selected characteristic
        const characteristicObj = generatedBrandVoiceCharacteristics.find(
          item => item.characteristic === statement
        );
        if (characteristicObj) {
          setSelectedBrandVoiceExplanation(characteristicObj.explanation);
        }
        onSelectBrandVoice(statement);
        break;
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleStatementExpansion = (statement: string) => {
    setExpandedStatements(prev => ({
      ...prev,
      [statement]: !prev[statement]
    }));
  };

  // Helper function to get explanation for a statement
  const getExplanationForStatement = (type: StatementType, statement: string): string => {
    switch (type) {
      case "mission": {
        const statementObj = generatedMissionStatementsWithExplanations.find(
          item => item.statement === statement
        );
        return statementObj?.explanation || "";
      }
      case "vision": {
        const statementObj = generatedVisionStatementsWithExplanations.find(
          item => item.statement === statement
        );
        return statementObj?.explanation || "";
      }
      case "valueProposition": {
        const statementObj = generatedValuePropositionsWithExplanations.find(
          item => item.statement === statement
        );
        return statementObj?.explanation || "";
      }
      case "brandEssence": {
        const statementObj = generatedBrandEssenceWithExplanations.find(
          item => item.statement === statement
        );
        return statementObj?.explanation || "";
      }
      case "brandVoice": {
        const characteristicObj = generatedBrandVoiceCharacteristics.find(
          item => item.characteristic === statement
        );
        return characteristicObj?.explanation || "";
      }
      default:
        return "";
    }
  };

  const renderStatementList = (
    type: StatementType, 
    statements: string[], 
    selectedStatement: string
  ) => {
    if (statements.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-center text-gray-500 mb-4">
            Click the button below to generate {type} statements for your brand
          </p>
          <Button 
            onClick={() => handleGenerateStatements(type)}
            disabled={loadingStates[type]}
          >
            {loadingStates[type] ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : statements.length > 0 ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate More Options
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')} Statements
              </>
            )}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {statements.map((statement, index) => (
            <div
              key={index}
              className={`
                relative p-4 rounded-md border transition-all
                ${statement === selectedStatement 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-gray-200 hover:border-primary/50"}
              `}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleSelectStatement(type, statement)}
              >
                <p className="pr-8">{statement}</p>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(statement);
                    }}
                  >
                    {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </Button>
                  {statement === selectedStatement && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatementExpansion(statement);
                    }}
                  >
                    {expandedStatements[statement] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedStatements[statement] && (
                <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                  <p className="font-medium mb-1">Why this works:</p>
                  <p>{getExplanationForStatement(type, statement)}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => handleGenerateStatements(type)}
            disabled={loadingStates[type]}
          >
            {loadingStates[type] ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate More Options
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Brand Messaging
        </CardTitle>
        <CardDescription>
          Generate mission, vision, and other key brand statements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as StatementType)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="mission">Mission</TabsTrigger>
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="valueProposition">Value Prop</TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="brandEssence">Brand Essence</TabsTrigger>
            <TabsTrigger value="brandVoice">Voice & Tone</TabsTrigger>
          </TabsList>

          <TabsContent value="mission">
            {renderStatementList("mission", generatedMissionStatements, selectedMissionStatement)}
          </TabsContent>

          <TabsContent value="vision">
            {renderStatementList("vision", generatedVisionStatements, selectedVisionStatement)}
          </TabsContent>

          <TabsContent value="valueProposition">
            {renderStatementList("valueProposition", generatedValuePropositions, selectedValueProposition)}
          </TabsContent>

          <TabsContent value="brandEssence">
            {renderStatementList("brandEssence", generatedBrandEssence, selectedBrandEssence)}
          </TabsContent>

          <TabsContent value="brandVoice">
            {renderStatementList("brandVoice", generatedBrandVoice, selectedBrandVoice)}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <p>
          {activeTab === "mission" && selectedMissionStatement && "Mission statement selected"}
          {activeTab === "vision" && selectedVisionStatement && "Vision statement selected"}
          {activeTab === "valueProposition" && selectedValueProposition && "Value proposition selected"}
          {activeTab === "brandEssence" && selectedBrandEssence && "Brand essence selected"}
          {activeTab === "brandVoice" && selectedBrandVoice && "Brand voice selected"}
        </p>
      </CardFooter>
    </Card>
  );
};
