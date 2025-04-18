import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for statements with explanations
export interface StatementWithExplanation {
  statement: string;
  explanation: string;
}

export interface ValueWithExplanation {
  value: string;
  explanation: string;
  application: string;
}

export interface VoiceCharacteristic {
  characteristic: string;
  explanation: string;
  examples: string;
}

// Initialize the Gemini API with the API key
const initGeminiApi = (apiKey: string) => {
  return new GoogleGenerativeAI(apiKey);
};

// Define the model name to use for all Gemini API calls
const MODEL_NAME = "gemini-1.5-pro";

// Helper function to call the Edge Function
const callEdgeFunction = async (type: string, data: Record<string, unknown>, apiKey: string) => {
  const { data: generatedData, error } = await supabase.functions.invoke(
    'generate-branding',
    {
      body: { type, data, apiKey },
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return generatedData.content;
};

// Generate brand name ideas with explanations
export const generateBrandNames = async (
  apiKey: string,
  industry: string,
  businessDescription: string,
  keywords: string[],
  count: number = 5
): Promise<{ name: string; explanation: string }[]> => {
  try {
    const genAI = initGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate ${count} creative and unique brand name ideas for a business with the following details:
    Industry: ${industry || "General"}
    Business Description: ${businessDescription || "A new business"}
    ${keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : ""}

    The names should be:
    - Memorable and distinctive
    - Relevant to the industry
    - Easy to pronounce and spell
    - Available as a domain name (conceptually, don't actually check)
    - Aligned with the business values and target audience

    For each name, provide:
    1. The brand name
    2. A brief explanation (1-2 sentences) of why this name works well for the business
    3. How it relates to the industry or business description

    Format each suggestion as:
    Name: [Brand Name]
    Explanation: [Brief explanation]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the response to extract names and explanations
    const nameBlocks = text.split(/(?=Name:)/);
    const namesWithExplanations = nameBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const nameMatch = block.match(/Name:\s*([^\n]+)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^\n]+)*)/);

        const name = nameMatch ? nameMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";

        return { name, explanation };
      })
      .filter(item => item.name && item.explanation);

    return namesWithExplanations;
  } catch (error) {
    console.error("Error generating brand names:", error);
    throw error;
  }
};

// Generate mission statement drafts with explanations
export const generateMissionStatements = async (
  apiKey: string,
  brandName: string,
  industry: string,
  targetAudience: string,
  values: string[],
  count: number = 3
): Promise<StatementWithExplanation[]> => {
  try {
    // Prepare data for the Edge Function
    const data = {
      name: brandName || "Brand",
      industry: industry || "General",
      productService: `serves ${targetAudience || "a general audience"} with values of ${values.length > 0 ? values.join(", ") : "excellence and integrity"}`
    };

    // Call the Edge Function with type 'mission'
    const content = await callEdgeFunction('mission', data, apiKey);

    // Parse the response to extract statements and explanations
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Statement:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^S][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";

        return { statement, explanation };
      })
      .filter(item => item.statement && item.explanation);

    return statementsWithExplanations.length > 0 ? statementsWithExplanations : [{ 
      statement: content, 
      explanation: "Generated mission statement based on your business details." 
    }];
  } catch (error) {
    console.error("Error generating mission statements:", error);
    throw error;
  }
};

// Generate vision statement drafts with explanations
export const generateVisionStatements = async (
  apiKey: string,
  brandName: string,
  industry: string,
  mission: string,
  count: number = 3
): Promise<StatementWithExplanation[]> => {
  try {
    // Prepare data for the Edge Function
    const data = {
      name: brandName || "Brand",
      industry: industry || "General",
      productService: `has a mission to ${mission || "provide excellent products/services"}`
    };

    // Call the Edge Function with type 'vision'
    const content = await callEdgeFunction('vision', data, apiKey);

    // Parse the response to extract statements and explanations
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Statement:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^S][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";

        return { statement, explanation };
      })
      .filter(item => item.statement && item.explanation);

    return statementsWithExplanations.length > 0 ? statementsWithExplanations : [{ 
      statement: content, 
      explanation: "Generated vision statement based on your business details." 
    }];
  } catch (error) {
    console.error("Error generating vision statements:", error);
    throw error;
  }
};

// Generate value proposition statements with explanations
export const generateValuePropositions = async (
  apiKey: string,
  brandName: string,
  industry: string,
  targetAudience: string,
  uniqueSellingPoints: string[],
  count: number = 3
): Promise<StatementWithExplanation[]> => {
  try {
    // Prepare data for the Edge Function
    const data = {
      name: brandName || "Brand",
      industry: industry || "General",
      productService: `serves ${targetAudience || "a general audience"} with ${uniqueSellingPoints.length > 0 ? uniqueSellingPoints.join(", ") : "unique offerings"}`
    };

    // Instead of calling the Edge Function, use the Gemini API directly
    const genAI = initGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate ${count} compelling value proposition statements for a business with the following details:
    Brand Name: ${data.name}
    Industry: ${data.industry}
    Target Audience/Product Service: ${data.productService}

    Each value proposition should:
    - Clearly communicate the unique value the brand offers
    - Be concise and memorable (1-2 sentences)
    - Focus on customer benefits rather than features
    - Differentiate the brand from competitors

    For each value proposition, provide:
    1. Statement: The value proposition itself
    2. Explanation: Why this value proposition works well for this brand and how it connects with the target audience

    Format each as:
    Statement: [Value Proposition]
    Explanation: [Why this works]
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response to extract statements and explanations
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Statement:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^S][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";

        return { statement, explanation };
      })
      .filter(item => item.statement && item.explanation);

    return statementsWithExplanations.length > 0 ? statementsWithExplanations : [{ 
      statement: content, 
      explanation: "Generated value proposition based on your business details." 
    }];
  } catch (error) {
    console.error("Error generating value propositions:", error);
    // Provide a more helpful error message
    throw new Error("Failed to generate value proposition statements. Please check your Gemini API key and try again.");
  }
};

// Generate brand essence/core message summaries with explanations
export const generateBrandEssence = async (
  apiKey: string,
  brandName: string,
  industry: string,
  mission: string,
  vision: string,
  values: string[],
  count: number = 3
): Promise<StatementWithExplanation[]> => {
  try {
    // Prepare data for the prompt
    const data = {
      name: brandName || "Brand",
      industry: industry || "General",
      mission: mission || "provide excellent products/services",
      vision: vision || "become a leader in the industry",
      values: values.length > 0 ? values.join(", ") : "excellence and integrity"
    };

    // Instead of calling the Edge Function, use the Gemini API directly
    const genAI = initGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate ${count} brand essence statements for a business with the following details:
    Brand Name: ${data.name}
    Industry: ${data.industry}
    Mission: ${data.mission}
    Vision: ${data.vision}
    Values: ${data.values}

    A brand essence is a 2-5 word phrase that captures the fundamental nature or core identity of a brand.
    It should be:
    - Timeless and enduring
    - Simple and memorable
    - Authentic to the brand's values
    - Emotionally resonant
    - Differentiating from competitors

    For each brand essence, provide:
    1. Essence: The 2-5 word brand essence statement
    2. Explanation: Why this essence captures the core of the brand and how it relates to the mission, vision, and values

    Format each as:
    Essence: [Brand Essence]
    Explanation: [Why this works]
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response to extract statements and explanations
    const essenceBlocks = content.split(/(?=Essence:)/);
    const essencesWithExplanations = essenceBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Essence:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^E][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";

        return { statement, explanation };
      })
      .filter(item => item.statement && item.explanation);

    return essencesWithExplanations.length > 0 ? essencesWithExplanations : [{ 
      statement: content, 
      explanation: "Generated brand essence based on your business details." 
    }];
  } catch (error) {
    console.error("Error generating brand essence:", error);
    // Provide a more helpful error message
    throw new Error("Failed to generate brand essence statements. Please check your Gemini API key and try again.");
  }
};

// Generate brand voice & tone guidelines with explanations
export const generateBrandVoice = async (
  apiKey: string,
  brandName: string,
  industry: string,
  targetAudience: string,
  brandPersonality: string,
  count: number = 3
): Promise<VoiceCharacteristic[]> => {
  try {
    // Prepare data for the prompt
    const data = {
      name: brandName || "Brand",
      industry: industry || "General",
      targetAudience: targetAudience || "a general audience",
      personality: brandPersonality || "professional and friendly"
    };

    // Instead of calling the Edge Function, use the Gemini API directly
    const genAI = initGeminiApi(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Generate ${count} brand voice characteristics for a business with the following details:
    Brand Name: ${data.name}
    Industry: ${data.industry}
    Target Audience: ${data.targetAudience}
    Brand Personality: ${data.personality}

    Brand voice defines how a brand communicates with its audience - the tone, language style, and personality expressed through words.

    For each voice characteristic, provide:
    1. Characteristic: A single word or short phrase describing an aspect of the brand voice (e.g., "Conversational", "Authoritative", "Playful")
    2. Explanation: Why this voice characteristic aligns with the brand and resonates with the target audience
    3. Examples: 2-3 short examples of copy that demonstrate this voice characteristic in action

    Format each as:
    Characteristic: [Voice Characteristic]
    Explanation: [Why this works for the brand]
    Examples: [Sample copy demonstrating this voice]
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response to extract voice characteristics with explanations and examples
    const characteristicBlocks = content.split(/(?=Characteristic:)/);
    const characteristicsWithDetails = characteristicBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const characteristicMatch = block.match(/Characteristic:\s*([^\n]+)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const examplesMatch = block.match(/Examples:\s*([^\n]+(?:\n[^C][^\n]+)*)/);

        const characteristic = characteristicMatch ? characteristicMatch[1].trim() : "";
        const explanation = explanationMatch ? explanationMatch[1].trim() : "";
        const examples = examplesMatch ? examplesMatch[1].trim() : "";

        return { characteristic, explanation, examples };
      })
      .filter(item => item.characteristic && item.explanation);

    // If no structured characteristics were found, try to extract general guidelines
    if (characteristicsWithDetails.length === 0) {
      // Extract sections that might contain voice characteristics
      const sections = content.split(/\n\n+/);
      const voiceCharacteristics = sections
        .filter(section => section.includes("voice") || section.includes("tone") || section.includes("characteristic"))
        .map(section => ({
          characteristic: section.split('\n')[0].trim(),
          explanation: section.split('\n').slice(1).join('\n').trim(),
          examples: ""
        }))
        .filter(item => item.characteristic && item.explanation);

      return voiceCharacteristics.length > 0 ? voiceCharacteristics : [{
        characteristic: "Brand Voice Guidelines",
        explanation: content,
        examples: ""
      }];
    }

    return characteristicsWithDetails;
  } catch (error) {
    console.error("Error generating brand voice guidelines:", error);
    // Provide a more helpful error message
    throw new Error("Failed to generate brand voice characteristics. Please check your Gemini API key and try again.");
  }
};
