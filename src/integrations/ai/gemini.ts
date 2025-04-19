import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  if (!apiKey) {
    throw new Error('API key is required');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Define the model name to use for all Gemini API calls
const MODEL_NAME = "gemini-1.5-pro";

// Helper function to call the Edge Function with retry logic
const callEdgeFunction = async (type: string, data: Record<string, unknown>, apiKey: string) => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      const { data: generatedData, error } = await supabase.functions.invoke(
        'generate-branding',
        {
          body: { type, data, apiKey },
        }
      );

      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          retryCount++;
          lastError = error;
          continue;
        }
        throw new Error(error.message);
      }

      if (!generatedData?.content) {
        throw new Error('No content received from the API');
      }

      return generatedData.content;
    } catch (error) {
      if (retryCount < maxRetries - 1) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
      throw lastError || error;
    }
  }

  throw lastError || new Error('Failed to generate content after multiple retries');
};

// Helper function to parse response text
const parseResponse = (text: string, pattern: RegExp): string => {
  const matches = text.match(pattern);
  if (!matches) {
    throw new Error('Failed to parse response');
  }
  return matches[1].trim();
};

// Enhanced helper function to parse response text with additional fields
const parseResponseWithDetails = (block: string): { statement: string; explanation: string } => {
  try {
    // Extract the main statement and explanation
    const statement = parseResponse(block, /Statement:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
    let explanation = parseResponse(block, /Explanation:\s*([^\n]+(?:\n[^(S|I|M|D|P|H|V|A|E)][^\n]+)*)/);
    
    // Look for additional fields that might be present
    try {
      // Mission statement specific fields
      const industryAlignmentMatch = block.match(/Industry Alignment:\s*([^\n]+(?:\n[^(S|D|M|P|H|V|A|E)][^\n]+)*)/);
      
      // Vision statement specific fields
      const missionAlignmentMatch = block.match(/Mission Alignment:\s*([^\n]+(?:\n[^(S|I|D|P|H|V|A|E)][^\n]+)*)/);
      const strategicDirectionMatch = block.match(/Strategic Direction:\s*([^\n]+(?:\n[^(S|I|M|P|H|V|A|E)][^\n]+)*)/);
      
      // Value proposition specific fields
      const differentiationMatch = block.match(/Differentiation:\s*([^\n]+(?:\n[^(S|I|M|P|A|H|V|E)][^\n]+)*)/);
      const painPointsMatch = block.match(/Pain Points:\s*([^\n]+(?:\n[^(S|I|M|D|P|H|V|A|E)][^\n]+)*)/);
      const painPointsAddressedMatch = block.match(/Pain Points Addressed:\s*([^\n]+(?:\n[^(S|I|M|D|P|H|V|A|E)][^\n]+)*)/);
      const proofPointsMatch = block.match(/Proof Points:\s*([^\n]+(?:\n[^(S|I|M|D|A|H|V|E)][^\n]+)*)/);
      
      // Brand essence specific fields
      const purposeConnectionMatch = block.match(/Purpose Connection:\s*([^\n]+(?:\n[^(S|I|M|D|P|A|H|V|E)][^\n]+)*)/);
      
      // Core values specific fields
      const applicationMatch = block.match(/Application:\s*([^\n]+(?:\n[^(S|I|M|D|P|H|V|E)][^\n]+)*)/);
      const exampleMatch = block.match(/Example:\s*([^\n]+(?:\n[^(S|I|M|D|P|A|H|V)][^\n]+)*)/);
      
      // Brand voice specific fields
      const whenToUseMatch = block.match(/When to Use:\s*([^\n]+(?:\n[^(S|I|M|D|P|A|H|E)][^\n]+)*)/);
      const whenToModerateMatch = block.match(/When to Moderate:\s*([^\n]+(?:\n[^(S|I|M|D|P|A|H|V|E)][^\n]+)*)/);
      
      // Generic fields
      const highlightMatch = block.match(/Highlight:\s*([^\n]+(?:\n[^(S|I|M|D|P|A|E|V|W)][^\n]+)*)/);
      
      // Add any additional fields to the explanation
      if (industryAlignmentMatch) {
        explanation += "\n\nIndustry Alignment: " + industryAlignmentMatch[1].trim();
      }
      if (missionAlignmentMatch) {
        explanation += "\n\nMission Alignment: " + missionAlignmentMatch[1].trim();
      }
      if (strategicDirectionMatch) {
        explanation += "\n\nStrategic Direction: " + strategicDirectionMatch[1].trim();
      }
      if (differentiationMatch) {
        explanation += "\n\nDifferentiation: " + differentiationMatch[1].trim();
      }
      if (painPointsMatch) {
        explanation += "\n\nPain Points: " + painPointsMatch[1].trim();
      }
      if (painPointsAddressedMatch) {
        explanation += "\n\nPain Points Addressed: " + painPointsAddressedMatch[1].trim();
      }
      if (proofPointsMatch) {
        explanation += "\n\nProof Points: " + proofPointsMatch[1].trim();
      }
      if (purposeConnectionMatch) {
        explanation += "\n\nPurpose Connection: " + purposeConnectionMatch[1].trim();
      }
      if (applicationMatch) {
        explanation += "\n\nApplication: " + applicationMatch[1].trim();
      }
      if (exampleMatch) {
        explanation += "\n\nExample: " + exampleMatch[1].trim();
      }
      if (whenToUseMatch) {
        explanation += "\n\nWhen to Use: " + whenToUseMatch[1].trim();
      }
      if (whenToModerateMatch) {
        explanation += "\n\nWhen to Moderate: " + whenToModerateMatch[1].trim();
      }
      if (highlightMatch) {
        explanation += "\n\nHighlight: " + highlightMatch[1].trim();
      }
    } catch (error) {
      // If we fail to parse additional fields, just continue with the basic explanation
      console.warn('Failed to parse additional fields:', error);
    }
    
    // Remove any markdown formatting (asterisks) from the explanation
    explanation = explanation.replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // Bold italic
                           .replace(/\*\*(.*?)\*\*/g, '$1')        // Bold
                           .replace(/\*(.*?)\*/g, '$1');           // Italic
    
    return { statement, explanation };
  } catch (error) {
    console.error('Failed to parse statement block:', block);
    throw error;
  }
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
    - Short (1-3 words maximum)
    - Not generic or descriptive of the service/product directly
    - Avoid overused prefixes/suffixes like "i-", "e-", "-ify", "-ly"

    For each name, provide:
    1. The brand name (just the name itself, no taglines or descriptors)
    2. A brief explanation (1-2 sentences) of why this name works well for the business
    3. How it relates to the industry or business description
    4. Any cultural or linguistic considerations

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
        try {
          const name = parseResponse(block, /Name:\s*([^\n]+)/);
          const explanation = parseResponse(block, /Explanation:\s*([^\n]+(?:\n[^\n]+)*)/);
          return { name, explanation };
        } catch (error) {
          console.error('Failed to parse name block:', block);
          return null;
        }
      })
      .filter((item): item is { name: string; explanation: string } => 
        item !== null && item.name && item.explanation
      );

    if (namesWithExplanations.length === 0) {
      throw new Error('No valid brand names were generated');
    }

    return namesWithExplanations;
  } catch (error) {
    console.error("Error generating brand names:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        toast.error('Invalid API key');
      } else if (error.message.includes('rate limit')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to generate brand names');
      }
    }
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

    // Parse the response to extract statements and explanations with enhanced details
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        try {
          return parseResponseWithDetails(block);
        } catch (error) {
          console.error('Failed to parse statement block:', block);
          return null;
        }
      })
      .filter((item): item is StatementWithExplanation => 
        item !== null && item.statement && item.explanation
      );

    if (statementsWithExplanations.length === 0) {
      return [{ 
        statement: content, 
        explanation: "Generated mission statement based on your business details." 
      }];
    }

    return statementsWithExplanations;
  } catch (error) {
    console.error("Error generating mission statements:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        toast.error('Invalid API key');
      } else if (error.message.includes('rate limit')) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to generate mission statements');
      }
    }
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

    // Parse the response to extract statements and explanations with enhanced details
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        try {
          return parseResponseWithDetails(block);
        } catch (error) {
          console.error('Failed to parse statement block:', block);
          return null;
        }
      })
      .filter((item): item is StatementWithExplanation => 
        item !== null && item.statement && item.explanation
      );

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
    - Be concise and memorable (1-2 sentences, maximum 25 words)
    - Focus on specific customer benefits rather than features
    - Address a clear pain point or desire of the target audience
    - Differentiate the brand from competitors in a meaningful way
    - Use concrete, specific language rather than vague claims
    - Be believable and provable, not making exaggerated claims
    - Use active voice and present tense
    - Avoid industry jargon and buzzwords
    - Include a clear "so that" benefit (explicit or implicit)

    For each value proposition, provide:
    1. Statement: The value proposition itself (clear, concise, and impactful)
    2. Explanation: Why this value proposition works well for this brand and how it connects with the target audience
    3. Pain Points: The specific customer problems or desires this addresses
    4. Differentiation: How this sets the brand apart from competitors
    5. Proof Points: How the business can demonstrate or validate this claim

    Format each as:
    Statement: [Value Proposition]
    Explanation: [Why this works]
    Pain Points: [Customer problems addressed]
    Differentiation: [Competitive advantage]
    Proof Points: [How to validate the claim]
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response to extract statements and explanations
    const statementBlocks = content.split(/(?=Statement:)/);
    const statementsWithExplanations = statementBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Statement:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^P][^\n]+)*)/);
        
        // Extract additional information if available, but don't require it
        const painPointsMatch = block.match(/Pain Points:\s*([^\n]+(?:\n[^D][^\n]+)*)/);
        const differentiationMatch = block.match(/Differentiation:\s*([^\n]+(?:\n[^P][^\n]+)*)/);
        const proofPointsMatch = block.match(/Proof Points:\s*([^\n]+(?:\n[^S][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        let explanation = explanationMatch ? explanationMatch[1].trim() : "";
        
        // Enhance explanation with additional information if available
        if (painPointsMatch) {
          explanation += "\n\nPain Points: " + painPointsMatch[1].trim();
        }
        if (differentiationMatch) {
          explanation += "\n\nDifferentiation: " + differentiationMatch[1].trim();
        }
        if (proofPointsMatch) {
          explanation += "\n\nProof Points: " + proofPointsMatch[1].trim();
        }

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
    - Extremely concise (2-5 words maximum)
    - Timeless and enduring, not tied to specific products or trends
    - Simple, memorable, and instantly understandable
    - Authentic to the brand's values and culture
    - Emotionally resonant with both internal and external audiences
    - Distinctive and ownable in the competitive landscape
    - Serve as a filter for all brand decisions and communications
    - Express the brand's ultimate purpose beyond profit
    - Capture the "soul" of the brand, not just its function
    - Be aspirational yet authentic

    For each brand essence, provide:
    1. Essence: The 2-5 word brand essence statement (no more than 5 words)
    2. Explanation: Why this essence captures the core of the brand and how it relates to the mission, vision, and values
    3. Purpose Connection: How this essence relates to the brand's deeper purpose
    4. Differentiation: How this essence stands apart from competitors in the same industry
    5. Application: How this essence can guide brand decisions and communications

    Format each as:
    Essence: [Brand Essence]
    Explanation: [Brief explanation]
    Purpose Connection: [How it relates to brand purpose]
    Differentiation: [How it stands apart from competitors]
    Application: [How it guides brand decisions]
    `;

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Parse the response to extract statements and explanations
    const essenceBlocks = content.split(/(?=Essence:)/);
    const essencesWithExplanations = essenceBlocks
      .filter(block => block.trim().length > 0)
      .map(block => {
        const statementMatch = block.match(/Essence:\s*([^\n]+(?:\n[^E][^\n]+)*)/);
        const explanationMatch = block.match(/Explanation:\s*([^\n]+(?:\n[^P][^\n]+)*)/);
        
        // Extract additional information if available, but don't require it
        const purposeMatch = block.match(/Purpose Connection:\s*([^\n]+(?:\n[^D][^\n]+)*)/);
        const differentiationMatch = block.match(/Differentiation:\s*([^\n]+(?:\n[^A][^\n]+)*)/);
        const applicationMatch = block.match(/Application:\s*([^\n]+(?:\n[^E][^\n]+)*)/);

        const statement = statementMatch ? statementMatch[1].trim() : "";
        let explanation = explanationMatch ? explanationMatch[1].trim() : "";
        
        // Enhance explanation with additional information if available
        if (purposeMatch) {
          explanation += "\n\nPurpose: " + purposeMatch[1].trim();
        }
        if (differentiationMatch) {
          explanation += "\n\nDifferentiation: " + differentiationMatch[1].trim();
        }
        if (applicationMatch) {
          explanation += "\n\nApplication: " + applicationMatch[1].trim();
        }

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
